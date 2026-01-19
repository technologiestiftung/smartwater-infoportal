import { searchAddressCases } from "./searchAddresses.cases";
import { searchAddresses } from "../../../src/server/actions/searchAddresses";

describe("searchAddresses", () => {
	it.each(searchAddressCases)("$name", async (c) => {
		const call = () =>
			c.kind === "forward"
				? searchAddresses(c.query)
				: searchAddresses("", c.lat, c.lon);

		if (c.expectedErrorCode) {
			await expect(call()).rejects.toThrow(c.expectedErrorCode);
			return;
		}

		const results = await call();
		expect(Array.isArray(results)).toBe(true);

		if (c.expectedMinResults != null) {
			expect(results.length).toBeGreaterThanOrEqual(c.expectedMinResults);
		}

		if (c.expectedMaxResults != null) {
			expect(results.length).toBeLessThanOrEqual(c.expectedMaxResults);
		}

		if (results.length > 0) {
			const r = results[0];
			expect(typeof r.lat).toBe("number");
			expect(typeof r.lon).toBe("number");
			expect(typeof r.name).toBe("string");
		}
	});
});
