"use server";

import { GeoServerClient } from "../../lib/geoserverClient";
import type { LocationData } from "../../lib/types";

const geoServerClient = new GeoServerClient();

export async function getHazardData(
	longitude: number,
	latitude: number,
): Promise<LocationData> {
	try {
		const result = await geoServerClient.findBuildingAtPoint(
			longitude,
			latitude,
		);
		if (result.found && result.buildingInformation) {
			const building = result.buildingInformation;
			return {
				building,
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
			floodZoneIndex: result.floodZoneIndex,
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
