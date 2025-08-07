"use server";

import { GeoServerClient } from "../../lib/geoserverClient";

const geoServer = new GeoServerClient();

export async function getHazardData(longitude: number, latitude: number) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result: any | null = await geoServer.findBuildingAtPoint(
			longitude,
			latitude,
		);
		if (result && result.found) {
			return {
				building: result,
				maxGefährdung: Math.max(
					result.starkregenGefährdung || 0,
					result.hochwasserGefährdung || 0,
				),
				found: true,
				...(result.distance && { distance: result.distance }),
			};
		}

		return {
			building: null,
			maxGefährdung: 0,
			found: false,
		};
	} catch {
		return {
			building: null,
			maxGefährdung: 0,
			found: false,
		};
	}
}
