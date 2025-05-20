// app/server/actions/getJoke.ts
"use server";

export async function getJoke() {
	const url = "https://official-joke-api.appspot.com/random_joke";

	try {
		/* 
		
		const response = await fetch(
			"https://www.berlin.de/rbmskzl/aktuelles/__i9/std/landesfooter.inc",
		);
		html = await response.text();
		
		*/

		const res = await fetch(url, {
			next: {
				revalidate: 60,
			},
		});

		if (!res.ok) {
			throw new Error("API request failed");
		}

		const data = await res.json();

		return {
			data,
		};
	} catch (err) {
		console.error("Failed to fetch warnings:", err);
		return {
			error: "Failed to fetch warnings",
		};
	}
}
