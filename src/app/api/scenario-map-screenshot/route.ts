/* eslint-disable */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = { url: string };

export async function POST(req: Request) {
	let browser: any = null;

	try {
		const { url } = (await req.json()) as Body;
		if (!url)
			return NextResponse.json({ error: "Missing url" }, { status: 400 });

		const isProd = process.env.NODE_ENV === "development" ? false : true;

		if (isProd) {
			// ✅ Netlify/serverless
			const puppeteer = (await import("puppeteer-core")).default;
			const chromium = (await import("@sparticuz/chromium")).default;

			browser = await puppeteer.launch({
				args: chromium.args,
				executablePath: await chromium.executablePath(),
				headless: true,
				defaultViewport: { width: 1140, height: 700 },
			});
		} else {
			// ✅ Local dev (macOS) — use bundled Chromium
			const puppeteer = (await import("puppeteer")).default;

			browser = await puppeteer.launch({
				headless: true,
				defaultViewport: { width: 1140, height: 700 },
			});
		}

		const page = await browser.newPage();
		await page.goto(url, { waitUntil: "networkidle2", timeout: 120_000 });

		await page.waitForFunction("window.__SCENARIOMAP_READY__ === true", {
			timeout: 120_000,
		});

		const buffer = await page.screenshot({ type: "jpeg", quality: 85 });

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
	} finally {
		try {
			await browser?.close();
		} catch {}
	}
}
