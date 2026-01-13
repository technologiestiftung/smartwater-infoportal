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
		if (result.found && result.building) {
			const building = result.building;
			return {
				building,
				found: true,
				...(building.distance && { distance: building.distance }),
			};
		}
		return {
			building: null,
			found: false,
		};
	} catch {
		return {
			building: null,
			found: false,
		};
	}
}
