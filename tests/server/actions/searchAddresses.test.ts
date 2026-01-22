import { searchAddressCases } from "./searchAddresses.cases";
import { searchAddresses } from "../../../src/server/actions/searchAddresses";

describe("searchAddresses", () => {
	it.each(searchAddressCases)("$query", async (c) => {
		const result =
			!!c.lat && !!c.lon
				? await searchAddresses("", c.lat, c.lon)
				: await searchAddresses(c.query ?? "");

		if (c.expectedErrorCode) {
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe(c.expectedErrorCode);
			}
			return;
		}

		expect(result.ok).toBe(true);
		if (!result.ok) return; // satisfies TS narrowing

		const results = result.data;
		expect(Array.isArray(results)).toBe(true);

		if (results.length > 0) {
			const hasHouseNumber = results.some((r) => r.hasHousenumber === true);
			expect(hasHouseNumber).toBe(true);
		}

		if (c.expectedMinResults != null) {
			expect(results.length).toBeGreaterThanOrEqual(c.expectedMinResults);
		}

		if (c.expectedMaxResults != null) {
			expect(results.length).toBeLessThanOrEqual(c.expectedMaxResults);
		}

		if (results.length === 0 && c.expectedResult != null) {
			const r = results[0];
			expect(typeof r.name).toBe(c.expectedResult);
		} else if (results.length > 0) {
			const r = results[0];
			expect(typeof r.lat).toBe("string");
			expect(typeof r.lon).toBe("string");
			expect(typeof r.name).toBe("string");
		}
	});
});
