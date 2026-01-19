/* eslint-disable */
"use server";

const berlinBbox: number[] = [
	13.091992716067702, 52.33488609760638, 13.742786470433, 52.67626223889507,
];

export async function searchAddresses(
	query: string,
	lat?: number,
	lon?: number,
) {
	const apiKey = process.env.MAPTILER_API_KEY;
	if (!apiKey) throw new Error("missingMapTilerKey");

	const isReverse = lat != null && lon != null;

	if (!isReverse && (!query || query.trim().length < 3)) return [];

	const params = new URLSearchParams({
		key: apiKey,
		language: "de",
		country: "de",
		limit: "10",
		fuzzyMatch: "false",
		autocomplete: "false",
	});

	// bbox makes no sense for reverse, skip it there
	if (!isReverse) {
		params.append("bbox", berlinBbox.join(","));
	}

	const path = isReverse ? `${lon},${lat}` : encodeURIComponent(query);

	const url = `https://api.maptiler.com/geocoding/${path}.json?${params.toString()}`;

	const res = await fetch(url);
	if (!res.ok) throw new Error(`maptiler_${res.status}`);

	const data = await res.json();

	return (data.features ?? [])
		.filter((f: any) => (f.relevance ?? 0) >= 0.7)
		.map((f: any) => ({
			lat: f.geometry.coordinates[1],
			lon: f.geometry.coordinates[0],
			name: f.place_name.replace(", Deutschland", ""),
			hasHousenumber: isNaN(Number(f.address)) ? false : true,
		}));
}
