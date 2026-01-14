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
		return result;
	} catch {
		return {
			found: false,
			building: null,
		};
	}
}
