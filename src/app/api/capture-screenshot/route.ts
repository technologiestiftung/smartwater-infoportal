/* eslint-disable */

import { getScenarioDomId } from "@/lib/utils/mapUtils";
import { Scenario } from "@/types/map";
import { after, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
	url: string;

	buildingGeometry?: any;
	outlineBufferGeometry?: any;

	floodRiskResultDown?: any;
	floodRiskAnswersDown?: any;
	hazardEntitiesDown?: any;

	scenarios?: string[];
};

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
			scenarios,
		} = (await req.json()) as Body;

		if (!url) {
			return NextResponse.json({ error: "Missing url" }, { status: 400 });
		}

		const isProd = process.env.NODE_ENV !== "development";

		const viewportWidth = 1140;
		const viewportHeight = 700;

		if (isProd) {
			const puppeteer = (await import("puppeteer-core")).default;
			const chromium = (await import("@sparticuz/chromium")).default;

			browser = await puppeteer.launch({
				args: chromium.args,
				executablePath: await chromium.executablePath(),
				headless: true,
				defaultViewport: {
					width: viewportWidth,
					height: viewportHeight,
				},
			});
		} else {
			const puppeteer = (await import("puppeteer")).default;
			browser = await puppeteer.launch({
				headless: true,
				defaultViewport: {
					width: viewportWidth,
					height: viewportHeight,
				},
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

		await page.evaluateOnNewDocument(
			(payload: any) => {
				// @ts-expect-error
				window.__SCREENSHOT_INPUT__ = payload;
			},
			{
				buildingGeometry,
				outlineBufferGeometry,
				floodRiskResultDown,
				floodRiskAnswersDown,
				hazardEntitiesDown,
				scenarios,
			},
		);

		await page.goto(url, { waitUntil: "networkidle2" });

		await page.waitForFunction("window.__SCREENSHOT_READY__ === true", {
			timeout: 20_000,
		});

		const totalHeight = await page.evaluate(() => {
			const body = document.body;
			const html = document.documentElement;

			return Math.max(
				body.scrollHeight,
				body.offsetHeight,
				html.clientHeight,
				html.scrollHeight,
				html.offsetHeight,
			);
		});

		await page.setViewport({
			width: viewportWidth,
			height: totalHeight,
		});

		await sleep(100);

		const fullBuffer = (await page.screenshot({
			type: "png",
			fullPage: false,
		})) as Buffer;

		const meta = await sharp(fullBuffer).metadata();

		if (!meta.width || !meta.height) {
			return NextResponse.json(
				{ error: "Could not determine screenshot dimensions" },
				{ status: 500 },
			);
		}

		const fullWidth = meta.width;
		const fullHeight = meta.height;

		const images: { key: string | null; dataUrl: string }[] = [];
		const sliceHeights = [300, 380, 500];

		const getNumberOfScenarios = scenarios?.length ?? 0;
		const widgetCounter = floodRiskResultDown ? 3 : 2;
		const counter = getNumberOfScenarios + widgetCounter;

		for (let i = 0; i < counter; i++) {
			let key: string | null = null;
			let left = 0;
			let top = 0;
			let width = 1140;
			let height = 700;

			if (i < getNumberOfScenarios) {
				top = i * 700;
				key = getScenarioDomId(scenarios?.[i] as Scenario);
			} else {
				const currentWidgetIndex = i - getNumberOfScenarios;

				top = getNumberOfScenarios * 700;

				if (currentWidgetIndex === 0) {
					key = "heavyRainWidget";
					height = sliceHeights[0];
				} else if (currentWidgetIndex === 1) {
					key = "fluvialFloodWidget";
					top += sliceHeights[0];
					height = sliceHeights[1];
				} else {
					key = "risk-block";
					top += sliceHeights[0] + sliceHeights[1];
					height = sliceHeights[2];
				}

				width = 400;
			}

			// clamp to actual screenshot bounds
			if (top >= fullHeight || left >= fullWidth) {
				console.error("Extract start is outside image bounds", {
					key,
					left,
					top,
					width,
					height,
					fullWidth,
					fullHeight,
				});
				break;
			}

			width = Math.min(width, fullWidth - left);
			height = Math.min(height, fullHeight - top);

			if (width <= 0 || height <= 0) {
				console.error("Invalid extract size", {
					key,
					left,
					top,
					width,
					height,
					fullWidth,
					fullHeight,
				});
				break;
			}

			const extractParams = { left, top, width, height };
			console.log("extractParams :>> ", extractParams);

			const chunkBuffer = await sharp(fullBuffer)
				.extract(extractParams)
				.jpeg({ quality: 100 })
				.toBuffer();

			images.push({
				key,
				dataUrl: `data:image/jpeg;base64,${chunkBuffer.toString("base64")}`,
			});
		}

		return NextResponse.json(images);
	} catch (e: any) {
		console.error("[combined-screenshot-error] ERROR:", e?.message);
		console.error(e?.stack);

		return NextResponse.json(
			{ error: e?.message ?? "Internal error" },
			{ status: 500 },
		);
	}
}
