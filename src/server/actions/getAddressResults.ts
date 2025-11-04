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
			)}&format=json&addressdetails=1&limit=40&viewbox=13.1,52.3,13.8,52.7&bounded=1`,
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

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const dataWithLabels = data.map((item: any) => {
			const addr = item.address;

			const street =
				addr.road || addr.pedestrian || addr.cycleway || addr.footway || "";
			const number = addr.house_number || "";
			const postcode = addr.postcode || "";
			const city = addr.city || addr.town || addr.village || addr.hamlet || "";

			// final display string
			const label =
				`${street}${number ? " " + number : ""}, ${postcode} ${city}`.trim();

			return {
				...item,
				label,
			};
		});

		return dataWithLabels;
	} catch (err) {
		console.error("Failed to fetch AddressResults:", err);
		return {
			error: `Failed to fetch AddressResults: ${JSON.stringify(err)}`,
		};
	}
}
