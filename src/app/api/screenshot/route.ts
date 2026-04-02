/* eslint-disable */

import { after, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
	url: string;
	buildingGeometry?: any; // GeoJSON geometry
	outlineBufferGeometry?: any; // GeoJSON geometry
	floodRiskResultDown?: any;
	floodRiskAnswersDown?: any;
	hazardEntitiesDown?: any;
};

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
	let browser: any = null;

	try {
		const body = (await req.json()) as Body;

		const { url } = body;

		if (!url)
			return NextResponse.json({ error: "Missing url" }, { status: 400 });

		const isProd = process.env.NODE_ENV === "development" ? false : true;

		let width = 400;
		let height = 380;
		if (url.includes("scenario")) {
			width = 1140;
			height = 700;
		} else if (url.includes("risk")) {
			height = 500;
		} else if (url.includes("heavyRain")) {
			height = 300;
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

		await page.evaluateOnNewDocument((payload: any) => {
			// @ts-expect-error
			window.__SCREENSHOT_INPUT__ = payload;
		}, body);

		// await page.goto(url, { waitUntil: "networkidle2" });

		// await page.goto(url, {
		// 	waitUntil: "load",
		// 	timeout: 60000,
		// });

		await page.goto(url, {
			waitUntil: "domcontentloaded",
			timeout: 60000,
		});

		await page.waitForFunction("window.__SCREENSHOT_READY__ === true", {
			timeout: 20_000,
		});

		const buffer = await page.screenshot({ type: "jpeg", quality: 100 });

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
}
