// app/server/actions/getAddressResults.ts
"use server";

export async function getAddressResults(search: string) {
	try {
		const userAgent = process.env.NOMINATIM_USER_AGENT;

		if (!userAgent) {
			throw new Error("Missing NOMINATIM_USER_AGENT environment variable");
		}

		const res = await fetch(
			`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
				search,
			)}&format=json&addressdetails=1&limit=5&viewbox=13.1,52.3,13.8,52.7&bounded=1`,
			{
				headers: {
					"User-Agent": userAgent,
				},
			},
		);

		if (!res.ok) {
			throw new Error("API request failed");
		}

		const data = await res.json();

		return data;
	} catch (err) {
		console.error("Failed to fetch AddressResults:", err);
		return {
			error: `Failed to fetch AddressResults: ${JSON.stringify(err)}`,
		};
	}
}
