"use server";

import { sanitizeAddressInput } from "@/lib/helpers/sanitizer";
import { CurrentUserAddress } from "@/lib/types";
import {
	containsNumber,
	looksLikeStreetWithHouseNumber,
} from "@/lib/utils/mapUtils";

interface PhotonProperties {
	osm_type?: string;
	osm_id?: number;
	osm_key?: string;
	osm_value?: string;
	name?: string;
	street?: string;
	locality?: string;
	housenumber?: string;
	postcode?: string;
	city?: string;
	district?: string;
	county?: string;
	state?: string;
	country?: string;
	countrycode?: string;
	extent?: number[];
}

interface PhotonFeature {
	type: "Feature";
	properties: PhotonProperties;
	geometry: {
		type: "Point";
		coordinates: [number, number];
	};
}

interface PhotonResponse {
	type: "FeatureCollection";
	features: PhotonFeature[];
}

export async function searchAddresses(
	query?: string,
	latArg?: number,
	lonArg?: number,
): Promise<CurrentUserAddress[]> {
	const isReverseSearch = !query || query.trim() === "";

	const baseURL = "https://photon.komoot.io";
	const bboxString =
		"13.091992716067702,52.33488609760638,13.742786470433,52.67626223889507";
	const filterCountry = "DE";
	const filterCity = "Berlin";

	let url;
	let params: URLSearchParams;
	let queryStreet: string | undefined;
	if (isReverseSearch) {
		if (latArg === undefined || lonArg === undefined) {
			throw new Error("");
		}
		params = new URLSearchParams({
			lat: String(latArg),
			lon: String(lonArg),
		});
	} else {
		const sanitizedQuery = sanitizeAddressInput(query);
		if (sanitizedQuery.trim().length < 2) {
			throw new Error("");
		} else if (
			looksLikeStreetWithHouseNumber(sanitizedQuery) &&
			!containsNumber(sanitizedQuery)
		) {
			throw new Error("noHouseNumber");
		}
		queryStreet = sanitizedQuery
			.replace(/\b\d+[a-zA-Z]?\b/g, "")
			.trim()
			.toLowerCase();
		params = new URLSearchParams({
			q: sanitizedQuery,
		});
	}

	params.append("bbox", bboxString);
	params.append("limit", "40");
	params.append("lang", "de");
	params.append("layer", "house");
	params.append("layer", "street");
	params.append("layer", "locality");

	if (isReverseSearch) {
		url = `${baseURL}/reverse?${params.toString()}`;
	} else {
		url = `${baseURL}/api?${params.toString()}`;
	}

	if (!url) {
		throw new Error("");
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 5000);

	let response: Response;
	try {
		response = await fetch(url, { signal: controller.signal });
		clearTimeout(timeoutId);
		if (!response.ok) {
			console.warn(`Address search failed with status: ${response.status}`);
			throw new Error("");
		}
	} catch (fetchError) {
		clearTimeout(timeoutId);
		if (fetchError instanceof Error && fetchError.name === "AbortError") {
			console.warn("Address search request timed out");
		} else {
			console.warn("Address search fetch error:", fetchError);
		}
		throw new Error("");
	}

	const data: PhotonResponse = await response.json();

	const filteredFeatures = data.features.filter((feature) => {
		const props = feature.properties;
		if (
			filterCountry &&
			props.countrycode?.toUpperCase() !== filterCountry.toUpperCase()
		) {
			return false;
		}

		if (filterCity) {
			const isInCity = props.city === filterCity;

			if (!isInCity) {
				return false;
			}
		}
		const excludeTypes = ["city", "country", "state"];
		if (excludeTypes.includes(props.osm_value || "")) {
			return false;
		}

		if (queryStreet && props.street) {
			const propStreet = props.street.toLowerCase();
			if (!propStreet.includes(queryStreet)) {
				return false;
			}
		}

		return true;
	});

	const filteredFeaturesWithDisplayName = filteredFeatures.map((feature) => {
		const props = feature.properties;

		let displayName = props.name || "";
		if (props.street) {
			if (displayName === "") {
				displayName = props.street;
			} else {
				displayName += `, ${props.street}`;
			}
			if (props.housenumber) {
				displayName += ` ${props.housenumber}`;
			}
		}
		/* if (props.locality) {
			displayName += displayName ? `, ${props.locality}` : props.locality;
		} */
		if (props.postcode) {
			displayName += displayName ? `, ${props.postcode}` : props.postcode;
		}
		if (props.city && displayName !== props.city) {
			displayName += displayName ? ` ${props.city}` : props.city;
		}
		if (!displayName) {
			displayName = props.city || props.district || props.county || "Unknown";
		}

		return {
			lat: feature.geometry.coordinates[1].toString(),
			lon: feature.geometry.coordinates[0].toString(),
			name: displayName,
			type: props.osm_value,
			hasHousenumber: !!props.housenumber,
		};
	});

	const seen = new Set();
	const uniqueFeatures = filteredFeaturesWithDisplayName.filter(
		(item: CurrentUserAddress) => {
			if (seen.has(item.name)) {
				return false;
			}
			seen.add(item.name);
			return true;
		},
	);
	if (uniqueFeatures.length === 0) {
		throw new Error("noResult");
	}
	return uniqueFeatures;
}
