/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { sanitizeAddressInput } from "@/lib/helpers/sanitizer";
import { AddressResult } from "@/lib/types";

export async function searchAddressesPhotonAPI(
	query: string,
): Promise<AddressResult> {
	const baseURL = "https://photon.komoot.io";
	const bboxString =
		"13.091992716067702,52.33488609760638,13.742786470433,52.67626223889507";
	const filterCountry = "DE";
	const filterCity = "Berlin";

	const sanitizedQuery = sanitizeAddressInput(query);

	const params = new URLSearchParams({
		q: sanitizedQuery,
	});

	const bboxArray = bboxString.split(",").map(Number);

	const [minLon, minLat, maxLon, maxLat] = bboxArray;
	const centerLon = ((minLon + maxLon) / 2).toString();
	const centerLat = ((minLat + maxLat) / 2).toString();
	params.append("lat", centerLat);
	params.append("lon", centerLon);
	params.append("layer", "house");
	params.append("layer", "street");
	params.append("layer", "locality");
	params.append("bbox", bboxString);
	params.append("limit", "40");
	params.append("lang", "de");
	params.append("location_bias_scale", "1.0");

	const url = `${baseURL}/api?${params.toString()}`;

	const response = await fetch(url);

	const data = await response.json();

	const filteredFeatures = data.features.filter((feature: any) => {
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

	const filteredFeaturesWithDisplayName = filteredFeatures.map(
		(feature: any) => {
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
				lat: Number(feature.geometry.coordinates[1]),
				lon: Number(feature.geometry.coordinates[0]),
				name: displayName,
				hasHousenumber: !!props.housenumber,
			};
		},
	);

	if (filteredFeaturesWithDisplayName.length === 0) {
		return { ok: false, code: "noResult" };
	}
	return { ok: true, data: filteredFeaturesWithDisplayName };
}
