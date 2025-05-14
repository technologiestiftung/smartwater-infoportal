// src/app/api/all-german-states/route.ts

export async function GET() {
	const bundeslandPrefixes: Record<string, string> = {
		BW: "084", // Baden-Württemberg
		BY: "09", // Bayern
		BE: "11", // Berlin
		BB: "12", // Brandenburg
		HB: "04", // Bremen
		HH: "02", // Hamburg
		HE: "06", // Hessen
		MV: "13", // Mecklenburg-Vorpommern
		NI: "03", // Niedersachsen
		NW: "05", // Nordrhein-Westfalen
		RP: "07", // Rheinland-Pfalz
		SL: "10", // Saarland
		SN: "14", // Sachsen
		ST: "15", // Sachsen-Anhalt
		SH: "01", // Schleswig-Holstein
		TH: "16", // Thüringen
	};

	const results: Record<string, number> = {};

	try {
		const fetches = Object.entries(bundeslandPrefixes).map(
			async ([stateCode, prefix]) => {
				const url = `https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd:Warnungen_Gemeinden&maxFeatures=5000&outputFormat=application/json&CQL_FILTER=WARNCELLID LIKE '${prefix}%'`;

				try {
					const res = await fetch(url);
					const data = await res.json();
					results[stateCode] = data.features?.length || 0;
				} catch {
					results[stateCode] = -1; // Use -1 to indicate failure for a specific state
				}
			},
		);

		await Promise.all(fetches);

		return new Response(JSON.stringify(results), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch {
		return new Response(
			JSON.stringify({ error: "Failed to fetch warnings for all states" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
