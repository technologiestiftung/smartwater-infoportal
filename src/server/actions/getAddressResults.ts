// app/server/actions/getAddressResults.ts
"use server";

export async function getAddressResults(search: string) {
	try {
		const res = await fetch(
			`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
				search,
			)}&format=json&addressdetails=1&limit=5`,
		);

		if (!res.ok) {
			throw new Error("API request failed");
		}

		const data = await res.json();

		return data;
	} catch (err) {
		console.error("Failed to fetch AddressResults:", err);
		return {
			error: "Failed to fetch AddressResults",
		};
	}
}
