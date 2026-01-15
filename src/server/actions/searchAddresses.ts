"use server";

import { sanitizeAddressInput } from "@/lib/helpers/sanitizer";
import { sortHouseFirst } from "@/lib/helpers/addressSearch";
import { CurrentUserAddress } from "@/lib/types";

const DEFAULT_LAT = "52.5";
const DEFAULT_LON = "13.4";

interface PhotonProperties {
	osm_type?: string;
	osm_id?: number;
	osm_key?: string;
	osm_value?: string;
	name?: string;
	street?: string;
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

	try {
		const baseURL = "https://photon.komoot.io";
		const bboxString =
			"13.091992716067702,52.33488609760638,13.742786470433,52.67626223889507";
		const filterCountry = "DE";
		const filterCity = "Berlin";

		let parsedBbox: number[] | null = null;

		if (bboxString) {
			const bboxArray = bboxString.split(",").map(Number);
			if (
				bboxArray.length === 4 &&
				bboxArray.every((val) => !isNaN(val) && isFinite(val))
			) {
				parsedBbox = bboxArray;
			} else {
				console.warn(
					`Invalid MAP_BOUNDING_BOX format: "${bboxString}". Expected 4 comma-separated numbers.`,
				);
			}
		}

		let url;
		if (isReverseSearch) {
			if (latArg === undefined || lonArg === undefined) {
				return [];
			}
			const params = new URLSearchParams({
				lat: String(latArg),
				lon: String(lonArg),
				limit: "5",
				lang: "de",
			});

			url = `${baseURL}/reverse?${params.toString()}`;
		} else {
			const sanitizedQuery = sanitizeAddressInput(query);
			if (sanitizedQuery.trim().length < 2) {
				return [];
			}
			const params = new URLSearchParams({
				q: sanitizedQuery,
				limit: "20",
				lang: "de",
			});

			if (parsedBbox) {
				const [minLon, minLat, maxLon, maxLat] = parsedBbox;
				const centerLon = ((minLon + maxLon) / 2).toString();
				const centerLat = ((minLat + maxLat) / 2).toString();
				params.append("lat", centerLat);
				params.append("lon", centerLon);
			} else {
				params.append("lat", DEFAULT_LAT);
				params.append("lon", DEFAULT_LON);
			}

			url = `${baseURL}/api/?${params.toString()}`;
		}

		if (!url) {
			return [];
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		let response: Response;
		try {
			response = await fetch(url, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (!response.ok) {
				console.warn(`Address search failed with status: ${response.status}`);
				return [];
			}
		} catch (fetchError) {
			clearTimeout(timeoutId);
			if (fetchError instanceof Error && fetchError.name === "AbortError") {
				console.warn("Address search request timed out");
			} else {
				console.warn("Address search fetch error:", fetchError);
			}
			return [];
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

			return true;
		});

		const filteredFeaturesWithDisplayName = filteredFeatures.map((feature) => {
			const props = feature.properties;

			let displayName = props.name || "";
			if (props.street) {
				displayName = props.street;
				if (props.housenumber) {
					displayName += ` ${props.housenumber}`;
				}
			}
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

		const sortedFeatures = sortHouseFirst(filteredFeaturesWithDisplayName);

		const seen = new Set();
		const uniqueFeatures = sortedFeatures.filter((item: CurrentUserAddress) => {
			if (seen.has(item.name)) {
				return false;
			}
			seen.add(item.name);
			return true;
		});
		return uniqueFeatures;
	} catch (error) {
		console.warn("Address search error:", error);
		return [];
	}
}
