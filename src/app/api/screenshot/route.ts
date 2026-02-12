/* eslint-disable */

import { after, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
	url: string;
	buildingGeometry?: any;
	outlineBufferGeometry?: any;
	floodRiskResultDown?: any;
	floodRiskAnswersDown?: any;
	hazardEntitiesDown?: any;
};

const isProd = process.env.NODE_ENV !== "development";

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
	let browser: any = null;

	try {
		const {
			url,
			buildingGeometry,
			outlineBufferGeometry,
			floodRiskResultDown,
			floodRiskAnswersDown,
			hazardEntitiesDown,
		} = (await req.json()) as Body;

		if (!url)
			return NextResponse.json({ error: "Missing url" }, { status: 400 });

		let width = 1140;
		let height = 700;
		if (url.includes("name=heavyRain")) {
			width = 400;
			height = 316;
		} else if (url.includes("name=fluvialFlood")) {
			width = 400;
			height = 380;
		} else if (url.includes("riskblock-screenshot")) {
			width = 400;
			height = 486;
		}

		if (isProd) {
			const puppeteer = (await import("puppeteer-core")).default;
			const chromium = (await import("@sparticuz/chromium")).default;

			browser = await puppeteer.launch({
				args: chromium.args,
				executablePath: await chromium.executablePath(),
				headless: true,
				defaultViewport: { width, height },
			});
		} else {
			const puppeteer = (await import("puppeteer")).default;
			browser = await puppeteer.launch({
				headless: true,
				defaultViewport: { width, height },
			});
		}

		// ✅ schedule cleanup that cannot block the response
		after(async () => {
			if (!browser) return;
			try {
				await Promise.race([browser.close(), sleep(1500)]);
			} catch {}
			try {
				browser.process?.()?.kill("SIGKILL");
			} catch {}
		});

		const page = await browser.newPage();

		// ✅ set UA/headers/interception BEFORE navigation (so it affects initial requests)
		await page.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
		);
		await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

		await page.setRequestInterception(true);
		page.on("request", (r: any) => {
			const u = r.url();
			if (u.includes("/api/screenshot")) return r.abort(); // prevent recursion
			r.continue();
		});

		if (buildingGeometry && outlineBufferGeometry) {
			await page.evaluateOnNewDocument(
				(payload: any) => {
					// @ts-expect-error
					window.__SCENARIO_INPUT__ = payload;
				},
				{ buildingGeometry, outlineBufferGeometry },
			);
		}

		if (floodRiskResultDown && floodRiskAnswersDown && hazardEntitiesDown) {
			await page.evaluateOnNewDocument(
				(payload: any) => {
					// @ts-expect-error
					window.__RISKBLOCK_INPUT__ = payload;
				},
				{ floodRiskResultDown, floodRiskAnswersDown, hazardEntitiesDown },
			);
		}

		// ✅ avoid networkidle for maps; it can hang on websockets/tiles
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

		// ✅ don’t wait 120s inside a 60s function. Cap it.
		const needsReadyFlag =
			(buildingGeometry && outlineBufferGeometry) ||
			(floodRiskResultDown && floodRiskAnswersDown && hazardEntitiesDown);

		if (needsReadyFlag) {
			await page.waitForFunction("window.__SCREENSHOT_READY__ === true", {
				timeout: 20_000, // keep under your maxDuration
			});
		} else {
			// small settle for normal pages
			await sleep(300);
		}

		const buffer = await page.screenshot({ type: "jpeg", quality: 90 });

		return NextResponse.json({
			imageBase64: Buffer.from(buffer).toString("base64"),
		});
	} catch (e: any) {
		console.error("[scenario-map-screenshot] ERROR:", e?.message);
		console.error(e?.stack);
		return NextResponse.json(
			{ error: e?.message ?? "Internal error" },
			{ status: 500 },
		);
	}
	// 🚫 NO finally that awaits browser.close()
}
