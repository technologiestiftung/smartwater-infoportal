import { generateMapfishScreenshot } from "@/lib/mapfish";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => ({}));

		const imageBuffer = await generateMapfishScreenshot(body);

		const isPNG =
			imageBuffer[0] === 0x89 &&
			imageBuffer[1] === 0x50 &&
			imageBuffer[2] === 0x4e &&
			imageBuffer[3] === 0x47;

		return new Response(imageBuffer, {
			headers: {
				"Content-Type": isPNG ? "image/png" : "application/octet-stream",
				"Content-Disposition": 'inline; filename="mapfish-screenshot.png"',
			},
		});
	} catch (error) {
		console.error("SCREENSHOT_ERROR:", error);
		const message = error instanceof Error ? error.message : String(error);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
