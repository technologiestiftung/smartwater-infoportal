// app/server/actions/getBerlinFooter.ts
"use server";

export async function getBerlinFooter() {
	const url =
		"https://www.berlin.de/rbmskzl/aktuelles/__i9/std/landesfooter.inc";

	try {
		const res = await fetch(url, {
			next: {
				revalidate: 86400,
			},
		});

		if (!res.ok) {
			throw new Error("API request failed");
		}

		const data = await res.text();

		return {
			data,
		};
	} catch (err) {
		console.error("Failed to fetch BerlinFooter:", err);
		return {
			error: "Failed to fetch BerlinFooter",
		};
	}
}
