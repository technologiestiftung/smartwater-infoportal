import { getHazardData } from "../../../src/server/actions/getHazardData";
import * as mockModule from "../../../src/lib/geoserverClient";

// Mock the GeoServerClient module
jest.mock("../../../src/lib/geoserverClient", () => {
	const mockFindBuildingAtPoint = jest.fn();
	const mockTestConnection = jest.fn();

	return {
		GeoServerClient: jest.fn(() => ({
			findBuildingAtPoint: mockFindBuildingAtPoint,
			testConnection: mockTestConnection,
		})),
		// Export the mocks so we can access them in tests
		__mockFindBuildingAtPoint: mockFindBuildingAtPoint,
		__mockTestConnection: mockTestConnection,
	};
});

// Import the mock functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindBuildingAtPoint = (mockModule as any).__mockFindBuildingAtPoint;

describe("getHazardData", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("with Berlin coordinates", () => {
		const testCoordinates = {
			longitude: 13.4118329,
			latitude: 52.5003982,
		};

		it("should return exact match when building is found at point", async () => {
			// Arrange
			const mockBuilding = {
				uuid: "test-uuid-123",
				address: "Test Address, Berlin",
				starkregenGefährdung: 3,
				hochwasserGefährdung: 2,
				geometry: { type: "Polygon", coordinates: [] },
				found: true,
			};

			mockFindBuildingAtPoint.mockResolvedValue(mockBuilding);

			// Act
			const result = await getHazardData(
				testCoordinates.longitude,
				testCoordinates.latitude,
			);

			// Assert
			expect(mockFindBuildingAtPoint).toHaveBeenCalledWith(
				testCoordinates.longitude,
				testCoordinates.latitude,
			);
			expect(result).toEqual({
				building: mockBuilding,
				starkregenGefährdung: 3,
				hochwasserGefährdung: 2,
				maxGefährdung: 3, // Math.max(3, 2)
				found: true,
			});
		});

		it("should return building with distance when found via progressive buffer search", async () => {
			// Arrange
			const mockBuildingWithDistance = {
				uuid: "test-uuid-456",
				address: "Nearest Building Address",
				starkregenGefährdung: 3,
				hochwasserGefährdung: 1,
				geometry: { type: "Polygon", coordinates: [] },
				distance: 75,
				found: true,
			};

			mockFindBuildingAtPoint.mockResolvedValue(mockBuildingWithDistance);

			// Act
			const result = await getHazardData(
				testCoordinates.longitude,
				testCoordinates.latitude,
			);

			// Assert
			expect(mockFindBuildingAtPoint).toHaveBeenCalledWith(
				testCoordinates.longitude,
				testCoordinates.latitude,
			);
			expect(result).toEqual({
				building: mockBuildingWithDistance,
				starkregenGefährdung: 3,
				hochwasserGefährdung: 1,
				maxGefährdung: 3, // Math.max(3, 1)
				found: true,
				distance: 75,
			});
		});

		it("should return zero values when no buildings found", async () => {
			// Arrange
			mockFindBuildingAtPoint.mockResolvedValue({ found: false });

			// Act
			const result = await getHazardData(
				testCoordinates.longitude,
				testCoordinates.latitude,
			);

			// Assert
			expect(mockFindBuildingAtPoint).toHaveBeenCalledWith(
				testCoordinates.longitude,
				testCoordinates.latitude,
			);
			expect(result).toEqual({
				starkregenGefährdung: 0,
				hochwasserGefährdung: 0,
				maxGefährdung: 0,
				found: false,
			});
		});

		it("should handle GeoServer errors gracefully", async () => {
			// Arrange
			mockFindBuildingAtPoint.mockRejectedValue(
				new Error("GeoServer connection failed"),
			);

			// Act
			const result = await getHazardData(
				testCoordinates.longitude,
				testCoordinates.latitude,
			);

			// Assert - should return safe defaults without throwing
			expect(result).toEqual({
				starkregenGefährdung: 0,
				hochwasserGefährdung: 0,
				maxGefährdung: 0,
				found: false,
			});
		});
	});
});
