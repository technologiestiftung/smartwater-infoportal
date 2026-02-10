import { GetBuildingWMSCases } from "./getBuildingWMS.cases";
import { searchAddresses } from "../../../src/server/actions/searchAddresses";
import { getHazardData } from "../../../src/server/actions/getHazardData";
import { GeoServerClient } from "@/lib/geoserverClient";

describe("getBuildingWMS", () => {
	it.each(GetBuildingWMSCases)(
		"$address",
		async (c) => {
			const { address } = c;
			const data = await searchAddresses(address);
			expect(data.length).toBeGreaterThan(0);
			const lon = Number(data[0].lon);
			const lat = Number(data[0].lat);
			expect(Number.isFinite(lon)).toBe(true);
			expect(Number.isFinite(lat)).toBe(true);
			const getHazardDataValue = await getHazardData(lon, lat);
			console.log("getHazardDataValue :>> ", getHazardDataValue);
			expect(getHazardDataValue).not.toBeNull();
			if (!getHazardDataValue?.building) {
				throw new Error("No building found for address: " + address);
			}
			const geoServerClient = new GeoServerClient();
			const buildingWMSData = await geoServerClient.getBuildingWMS(
				getHazardDataValue?.building,
			);
			console.log("buildingWMSData :>> ", buildingWMSData);
			return;
		},
		480_000,
	);
});
