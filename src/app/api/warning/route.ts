// src/app/api/warning/route.ts

export async function GET() {
	const url1 =
		"https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd%3AWarnungen_Gemeinden&maxFeatures=5000&outputFormat=application%2Fjson&CQL_FILTER=WARNCELLID%20LIKE%20%2711100%25%27";
	const url2 = `https://api.hochwasserzentralen.de/public/v1/data/stations?states=BE`;

	try {
		const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);

		if (!res1.ok || !res2.ok) {
			throw new Error("One or both API requests failed");
		}

		const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

		const lhpWarnings = data2?.features?.filter(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(item: any) => item.properties?.lhpClass > 0,
		);

		// Return something basic for now
		return new Response(
			JSON.stringify({
				dwdWarnings: data1?.features,
				lhpWarnings,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch {
		return new Response("Failed to fetch warnings", { status: 500 });
	}
}
