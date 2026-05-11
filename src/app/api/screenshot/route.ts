/* eslint-disable */

import { ScreenshotRequestBody } from "@/types/map";
import { after, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
	let browser: any = null;

	try {
		const body = (await req.json()) as ScreenshotRequestBody;

		const { url } = body;

		if (!url)
			return NextResponse.json({ error: "Missing url" }, { status: 400 });

		const isProd = process.env.NODE_ENV === "development" ? false : true;

		const isScenario = url.includes("scenario");

		let width = 400;
		let height = 800;
		if (isScenario) {
			width = 1140;
			height = 700;
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

		await page.goto(url, {
			waitUntil: "networkidle0",
			timeout: 60000,
		});

		await page.waitForFunction(
			// @ts-expect-error puppeteer injects this global at runtime
			() => window.__SCREENSHOT_READY__?.ready === true,
			{ timeout: 20_000 },
		);

		const screenshotHeight = await page.evaluate(
			// @ts-expect-error puppeteer injects this global at runtime
			() => window.__SCREENSHOT_READY__?.height ?? 1000,
		);

		const screenshotOptions: any = {
			type: "jpeg",
			quality: 100,
		};

		if (!isScenario) {
			screenshotOptions.clip = {
				x: 0,
				y: 0,
				width: 400,
				height: Math.ceil(screenshotHeight),
			};
		}

		const buffer = await page.screenshot(screenshotOptions);

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
