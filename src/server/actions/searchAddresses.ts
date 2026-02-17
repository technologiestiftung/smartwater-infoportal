/* eslint-disable */
"use server";

import { AddressResult, CurrentUserAddress } from "@/lib/types";
import { containsNumber, extractGermanZipCode } from "@/lib/utils/mapUtils";
import { searchAddressesPhotonAPI } from "./searchAddressesPhotonAPI";
import { findAlkisBuilding } from "./findAlkisBuilding";

const berlinBbox: number[] = [
	13.091992716067702, 52.33488609760638, 13.742786470433, 52.67626223889507,
];

const getAlkisResults = async (uniqueFeatures: CurrentUserAddress[]) => {
	const uniqueFeaturesWithHousenumber = uniqueFeatures.filter(
		(f) => f.hasHousenumber,
	);

	const alkisResults: CurrentUserAddress[] = [];

	for (const feature of uniqueFeaturesWithHousenumber) {
		const { lat, lon } = feature;
		if (!lat || !lon) continue;

		const longitude = parseFloat(lon);
		const latitude = parseFloat(lat);
		const result = await findAlkisBuilding(longitude, latitude);
		if (result.found && result.building) {
			alkisResults.push({
				...feature,
				alkisName: result.building.address,
				building: result.building,
			});
		}
	}
	return alkisResults;
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
		.filter((f: any) =>
			f.context.some((c: any) => c.text_de.toLowerCase().includes("berlin")),
		)
		.map((f: any) => ({
			lat: f.geometry.coordinates[1].toString(),
			lon: f.geometry.coordinates[0].toString(),
			name: f.place_name.replace(", Deutschland", ""),
			hasHousenumber:
				containsNumber(f.address ?? "") || containsNumber(f.text ?? ""),
		}))
		.filter((f: any) => {
			if (!germanZIPCode) return true;
			return f.name.includes(germanZIPCode);
		});

	const seen = new Set();
	const uniqueFeatures = filteredResults.filter((item: CurrentUserAddress) => {
		if (seen.has(item.name)) {
			return false;
		}
		seen.add(item.name);
		return true;
	});

	if (!uniqueFeatures.some((addr) => addr.hasHousenumber) && !isReverse) {
		const getPhoneAPIResult = await searchAddressesPhotonAPI(query);
		if (getPhoneAPIResult.ok) {
			const firstWordOfQuery = query.split(" ")[0].toLowerCase();
			const findPhotonHit = getPhoneAPIResult.data.filter(
				(addr) =>
					addr.name.toLowerCase().startsWith(firstWordOfQuery) &&
					addr.hasHousenumber,
			);
			if (findPhotonHit.length > 0) {
				return {
					ok: true,
					data: [...findPhotonHit, ...uniqueFeatures],
				};
			}
		}
	}

	if (uniqueFeatures.length === 0) {
		return { ok: false, code: "noResult" };
	}

	return { ok: true, data: uniqueFeatures };
}
