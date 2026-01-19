import { config } from "dotenv";

config({ path: ".env" });
process.env.MAPTILER_API_KEY ??= "test-key";

global.fetch = jest.fn(async (input: any) => {
	const url = String(input);

	// Extract the query part from the path:
	// https://api.maptiler.com/geocoding/<PATH>.json?...
	const match = url.match(/\/geocoding\/(.+)\.json\?/);
	const path = match ? decodeURIComponent(match[1]) : "";

	// Reverse requests look like "13.4,52.5"
	const isReverse = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(path);

	// Forward "garbage" queries should return zero results
	const isGarbage = !isReverse && /lorem\s+ipsum/i.test(path); // add other garbage triggers if you want

	if (isGarbage) {
		return {
			ok: true,
			status: 200,
			json: async () => ({ features: [] }),
		} as any;
	}

	// Default: return one valid result
	return {
		ok: true,
		status: 200,
		json: async () => ({
			features: [
				{
					geometry: { coordinates: [13.404954, 52.520008] },
					properties: {
						place_name: "Mockstraße 1, 10115 Berlin, Deutschland",
						relevance: 0.99,
						housenumber: "1",
						street: "Mockstraße",
					},
				},
			],
		}),
	} as any;
}) as any;
