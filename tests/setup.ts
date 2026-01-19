import { config } from "dotenv";

config({ path: ".env" });

// Ensure MAPTILER_API_KEY exists in tests (use a dummy value for mocked fetch)
process.env.MAPTILER_API_KEY ??= "test-key";

// Mock global fetch for Node/Jest
global.fetch = jest.fn(async () => {
	return {
		ok: true,
		status: 200,
		json: async () => ({
			features: [
				{
					geometry: { coordinates: [13.404954, 52.520008] },
					place_name: "Mockstraße 1, 10115 Berlin, Deutschland",
					relevance: 0.99,
					properties: { housenumber: "1", street: "Mockstraße" },
				},
			],
		}),
	} as any;
}) as any;
