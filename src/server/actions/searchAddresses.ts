/* eslint-disable */
"use server";

type MapTilerAddress = {
	lat: number;
	lon: number;
	displayName: string;
	street?: string;
	housenumber?: string;
	postcode?: string;
	city?: string;
};
export async function searchAddressesOld(
	query: string,
	lat?: number,
	lon?: number,
): Promise<MapTilerAddress[]> {
	if (!query || query.trim().length < 3) throw new Error("queryMissing");

	const apiKey = process.env.MAPTILER_API_KEY;

	if (!apiKey) throw new Error("missingMapTilerKey");

	const params = new URLSearchParams({
		key: apiKey,
		language: "de",
		limit: "10",
		country: "de",
		autocomplete: "true",
		types: "address",
		fuzzyMatch: "false",
	});

	const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
		query,
	)}.json?${params.toString()}`;

	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`MapTiler error ${res.status}`);
	}

	const data = await res.json();

	console.log("data :>> ", JSON.stringify(data));

	return [];

	return (data.features ?? []).map((feature: any) => {
		const props = feature.properties;

		return {
			lat: feature.geometry.coordinates[1],
			lon: feature.geometry.coordinates[0],
			displayName: props.place_name,
			street: props.street,
			housenumber: props.housenumber,
			postcode: props.postcode,
			city: props.locality || props.place,
		};
	});
}

const berlinBbox: [number, number, number, number] = [
	13.091992716067702, 52.33488609760638, 13.742786470433, 52.67626223889507,
];

export async function searchAddresses(query: string) {
	const apiKey = process.env.MAPTILER_API_KEY;
	if (!apiKey) throw new Error("missingMapTilerKey");
	if (!query || query.trim().length < 3) return [];

	const params = new URLSearchParams({
		key: apiKey,
		language: "de",
		limit: "10",
		autocomplete: "true",
		types: "address",
		country: "de",
	});

	params.append("bbox", berlinBbox.join(","));

	const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
		query,
	)}.json?${params.toString()}`;

	const res = await fetch(url);
	if (!res.ok) throw new Error(`maptiler_${res.status}`);

	const data = await res.json();

	console.log("data :>> ", JSON.stringify(data));
	return (data.features ?? []).map((f: any) => ({
		lat: f.geometry.coordinates[1],
		lon: f.geometry.coordinates[0],
		name: f.place_name.replace(", Deutschland", ""),
		hasHousenumber: isNaN(Number(f.address)) ? false : true,
	}));
}
