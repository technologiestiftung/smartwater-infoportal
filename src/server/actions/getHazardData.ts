"use server";

import { GeoServerClient } from "../../lib/geoserverClient";

const geoServer = new GeoServerClient();

export async function getHazardData(longitude: number, latitude: number) {
	try {
		const result = await geoServer.findBuildingAtPoint(longitude, latitude);
		if (result.found) {
			return {
				building: result,
				starkregenGefährdung: result.starkregenGefährdung,
				hochwasserGefährdung: result.hochwasserGefährdung,
				maxGefährdung: Math.max(
					result.starkregenGefährdung,
					result.hochwasserGefährdung,
				),
				found: true,
				...(result.distance && { distance: result.distance }),
			};
		}

		return {
			starkregenGefährdung: 0,
			hochwasserGefährdung: 0,
			maxGefährdung: 0,
			found: false,
		};
	} catch {
		return {
			starkregenGefährdung: 0,
			hochwasserGefährdung: 0,
			maxGefährdung: 0,
			found: false,
		};
	}
}
