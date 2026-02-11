"use server";

import { GeoServerClient } from "../../lib/geoserverClient";
import type { Building, BuildingWMS, LocationData } from "../../lib/types";

const geoServerClient = new GeoServerClient();

export async function getHazardData(
	longitude: number,
	latitude: number,
): Promise<LocationData> {
	try {
		return await geoServerClient.findBuildingAtPoint(longitude, latitude);
	} catch {
		return {
			found: false,
			building: null,
		};
	}
}

export async function getWMSForBuilding(
	locationData: LocationData,
): Promise<BuildingWMS | null> {
	if (!locationData?.building) {
		return null;
	}
	try {
		return await geoServerClient.getBuildingWMS(locationData?.building);
	} catch {
		return null;
	}
}
