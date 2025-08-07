import { getHazardData } from "../../../src/server/actions/getHazardData";
import { GeoServerClient } from "../../../src/lib/geoserverClient";

// Integration test - uses REAL GeoServer (no mocks)
describe("getHazardData Integration Test", () => {
	const testCoordinates = {
		longitude: 13.4118329,
		latitude: 52.5003982,
	};

	beforeAll(async () => {
		// Test if GeoServer is available
		const geoServer = new GeoServerClient();
		try {
			const isConnected = await geoServer.testConnection();
			if (!isConnected) {
				console.warn(
					"⚠️  GeoServer not available - skipping integration tests",
				);
			}
		} catch (error) {
			console.warn("⚠️  GeoServer connection failed:", error);
		}
	});

	it("should connect to real GeoServer and return valid data", async () => {
		const result = await getHazardData(
			testCoordinates.longitude,
			testCoordinates.latitude,
		);

		// Basic structure validation
		expect(result).toHaveProperty("found");
		expect(result).toHaveProperty("building");
		expect(result).toHaveProperty("maxGefährdung");

		// The result should be either found with data OR legitimately not found (no errors)
		if (result.found) {
			expect(result.maxGefährdung).toBeGreaterThanOrEqual(0);

			if (result.building) {
				expect(result.building).toHaveProperty("uuid");
				expect(result.building.starkregenGefährdung).toBeGreaterThanOrEqual(0);
				expect(result.building.hochwasserGefährdung).toBeGreaterThanOrEqual(0);
			}
		} else {
			expect(result.building).toBeNull();
		}
	}, 10000); // 10 second timeout for network requests

	it("should test GeoServer connection directly", async () => {
		const geoServer = new GeoServerClient();

		const connectionResult = await geoServer.testConnection();

		if (connectionResult) {
			expect(connectionResult).toBe(true);
		} else {
			console.warn("❌ GeoServer connection failed");
			console.warn("🔍 Check:");
			console.warn("   - Is GeoServer running on the expected URL?");
			console.warn("   - Does the Smartwater workspace exist?");
			console.warn("   - Is the alkis layer published?");

			// Fail the test if GeoServer is not available
			expect(connectionResult).toBe(true);
		}
	}, 5000);
});
