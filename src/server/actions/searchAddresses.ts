/* eslint-disable */
"use server";

import { CurrentUserAddress } from "@/lib/types";
import { containsNumber, extractGermanZipCode } from "@/lib/utils/mapUtils";

const berlinBbox: number[] = [
	13.091992716067702, 52.33488609760638, 13.742786470433, 52.67626223889507,
];

export async function searchAddresses(
	query: string,
	lat?: number,
	lon?: number,
): Promise<CurrentUserAddress[]> {
	const apiKey = process.env.MAPTILER_API_KEY;
	if (!apiKey) throw new Error("missingMapTilerKey");

	const isReverse = lat != null && lon != null;

	if (!isReverse && (!query || query.trim().length < 3)) return [];

	const params = new URLSearchParams({
		key: apiKey,
		language: "de",
		country: "de",
	});

	if (!isReverse) {
		params.append("bbox", berlinBbox.join(","));
		params.append("fuzzyMatch", "false");
		params.append("autocomplete", "false");
		params.append("limit", "20");
	} else {
		params.set("limit", "1");
		params.set("types", "address");
	}

	const path = isReverse ? `${lon},${lat}` : encodeURIComponent(query);

	const url = `https://api.maptiler.com/geocoding/${path}.json?${params.toString()}`;

	const res = await fetch(url);
	if (!res.ok) throw new Error(`maptiler_${res.status}`);

	const germanZIPCode = extractGermanZipCode(query);

	const data = await res.json();

	return (data.features ?? [])
		.filter(
			(f: any) =>
				(f.relevance ?? 0) >= 0.7 ||
				!f.geometry.coordinates[1] ||
				!f.geometry.coordinates[0],
		)
		.filter((f: any) => {
			if (!germanZIPCode) return true;
			return f.place_name.includes(germanZIPCode);
		})
		.map((f: any) => ({
			lat: f.geometry.coordinates[1],
			lon: f.geometry.coordinates[0],
			name: f.place_name.replace(", Deutschland", ""),
			hasHousenumber:
				containsNumber(f.address ?? "") || containsNumber(f.text ?? ""),
		}));
}
