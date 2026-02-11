"use server";

import { GeoServerClient } from "../../lib/geoserverClient";
import type { BuildingWMS, LocationData } from "../../lib/types";

const geoServerClient = new GeoServerClient();

export async function getBuilding(
	longitude: number,
	latitude: number,
): Promise<{
	locationData: LocationData | null;
	buildingWMSData: BuildingWMS | null;
}> {
	try {
		return await geoServerClient.getBuilding(longitude, latitude);
	} catch {
		return { locationData: null, buildingWMSData: null };
	}
}
