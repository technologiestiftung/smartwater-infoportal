/* eslint-disable */
"use server";

import { CurrentUserAddress } from "@/lib/types";
import { containsNumber, extractGermanZipCode } from "@/lib/utils/mapUtils";

const berlinBbox: number[] = [
	13.091992716067702, 52.33488609760638, 13.742786470433, 52.67626223889507,
];

type AddressResult =
	| { ok: true; data: CurrentUserAddress[] }
	| {
			ok: false;
			code: "noResult" | "maptilerError";
	  };

export async function searchAddresses(
	query: string,
	lat?: number,
	lon?: number,
): Promise<AddressResult> {
	const apiKey = process.env.MAPTILER_API_KEY;
	if (!apiKey) return { ok: false, code: "maptilerError" };

	const isReverse = !!lat && !!lon;

	const params = new URLSearchParams({
		key: apiKey,
		language: "de",
		country: "de",
	});

	if (!isReverse) {
		params.append("bbox", berlinBbox.join(","));
		params.append("fuzzyMatch", "false");
		params.append("autocomplete", "false");
		params.append("limit", "10");
	} else {
		params.set("limit", "1");
		params.set("types", "address");
	}

	const path = isReverse ? `${lon},${lat}` : encodeURIComponent(query);

	const url = `https://api.maptiler.com/geocoding/${path}.json?${params.toString()}`;

	const res = await fetch(url);
	if (!res.ok) return { ok: false, code: "maptilerError" };
	const germanZIPCode = extractGermanZipCode(query);

	const data = await res.json();

	const filteredResults: CurrentUserAddress[] = data.features
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
		}))
		.filter((addr: CurrentUserAddress) => {
			if (isReverse) return true;
			const firstWordOfQuery = query.trim().split(" ")[0].toLowerCase();
			if (addr.name.toLowerCase().startsWith(firstWordOfQuery)) {
				return true;
			}
			return false;
		});

	if (filteredResults.length === 0) {
		return { ok: false, code: "noResult" };
	}

	return { ok: true, data: filteredResults };
}
