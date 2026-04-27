import * as turf from "@turf/turf";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { polygon, wfsUrl, typeName } = await req.json();

	try {
		const bbox = turf.bbox(polygon);

		const wfsParams = new URLSearchParams({
			service: "WFS",
			version: "1.1.0",
			request: "GetFeature",
			typeName: typeName,
			outputFormat: "application/json",
			bbox: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`,
			srsName: "EPSG:25833",
		});

		const wfsUrlFull = `${wfsUrl}?${wfsParams}`;
		const response = await fetch(wfsUrlFull);
		const text = await response.text();

		// Wenn XML zurückkommt, leeres Result
		if (text.startsWith("<?xml") || text.startsWith("<")) {
			console.log(`[API] ${typeName}: JSON not supported, skipping`);
			return NextResponse.json({
				type: "FeatureCollection",
				features: [],
				skipped: true,
			});
		}

		const data = JSON.parse(text);

		const intersected =
			data.features?.filter((feature: any) => {
				return turf.booleanIntersects(polygon, feature);
			}) || [];

		return NextResponse.json({
			type: "FeatureCollection",
			features: intersected,
		});
	} catch (error) {
		console.error(`[API] ${typeName} Error::`, error);
		return NextResponse.json(
			{
				type: "FeatureCollection",
				features: [],
				error: String(error),
			},
			{ status: 200 },
		);
	}
}
