// src/app/api/berlin-footer/route.ts
import { getBerlinFooter } from "@/lib/getBerlinFooter";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const html = await getBerlinFooter();
		return NextResponse.json({ html });
	} catch (error) {
		return NextResponse.json(
			{ error: `Failed to fetch footer: ${JSON.stringify(error)}` },
			{ status: 500 },
		);
	}
}
