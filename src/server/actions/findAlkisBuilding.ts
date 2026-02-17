"use server";

import { GeoServerClient } from "../../lib/geoserverClient";
import type { LocationData } from "../../lib/types";

const geoServerClient = new GeoServerClient();

export async function findAlkisBuildingAtPoint(
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

export async function findAlkisBuilding(
	longitude: number,
	latitude: number,
): Promise<any> {
	try {
		return await geoServerClient.findBuilding(longitude, latitude);
	} catch {
		return {
			found: false,
			building: null,
		};
	}
}
