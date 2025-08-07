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
			const building = result.buildingInformation;
			return {
				building: building,
				maxGefährdung: Math.max(
					building.starkregenGefährdung || 0,
					building.hochwasserGefährdung || 0,
				),
				found: true,
				floodZoneIndex: result.floodZoneIndex,
				...(building.distance && { distance: building.distance }),
			};
		}

		return {
			building: null,
			maxGefährdung: 0,
			found: false,
			floodZoneIndex: result?.floodZoneIndex || null,
		};
	} catch {
		return {
			building: null,
			maxGefährdung: 0,
			found: false,
			floodZoneIndex: null,
		};
	}
}
