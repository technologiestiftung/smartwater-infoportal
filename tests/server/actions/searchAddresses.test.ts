import { searchAddressCases } from "./searchAddresses.cases";
import { searchAddresses } from "../../../src/server/actions/searchAddresses";

describe("searchAddresses", () => {
	it.each(searchAddressCases)("$name", async (testCase) => {
		const results =
			"query" in testCase
				? await searchAddresses(testCase.query)
				: await searchAddresses("", testCase.lat, testCase.lon);

		expect(Array.isArray(results)).toBe(true);
		expect(results.length).toBeGreaterThanOrEqual(
			testCase.expectedMinResults ?? 0,
		);
	});
});
