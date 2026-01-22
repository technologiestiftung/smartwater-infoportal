/* eslint-disable */
"use server";

import { AddressResult, CurrentUserAddress } from "@/lib/types";
import { containsNumber, extractGermanZipCode } from "@/lib/utils/mapUtils";
import { searchAddressesPhotonAPI } from "./searchAddressesPhotonAPI";

const berlinBbox: number[] = [
	13.091992716067702, 52.33488609760638, 13.742786470433, 52.67626223889507,
];

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
		params.append("fuzzyMatch", "true");
		params.append("autocomplete", "true");
		params.append("limit", "10");
	} else {
		params.set("limit", "3");
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
		.map((f: any) => ({
			lat: f.geometry.coordinates[1],
			lon: f.geometry.coordinates[0],
			name: f.place_name.replace(", Deutschland", ""),
			hasHousenumber:
				containsNumber(f.address ?? "") || containsNumber(f.text ?? ""),
		}))
		.filter((f: any) => {
			if (!germanZIPCode) return true;
			return f.name.includes(germanZIPCode);
		});

	if (!filteredResults.some((addr) => addr.hasHousenumber) && !isReverse) {
		const getPhoneAPIResult = await searchAddressesPhotonAPI(query);
		if (getPhoneAPIResult.ok) {
			const firstWordOfQuery = query.split(" ")[0].toLowerCase();
			const findPhotonHit = getPhoneAPIResult.data.filter(
				(addr) =>
					addr.name.toLowerCase().includes(firstWordOfQuery) &&
					addr.hasHousenumber,
			);
			if (findPhotonHit.length > 0) {
				return {
					ok: true,
					data: [...findPhotonHit, ...filteredResults],
				};
			}
		}
	}

	return { ok: true, data: filteredResults };
}
