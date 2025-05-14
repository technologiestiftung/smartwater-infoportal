import fs from "fs";
import path from "path";

const isDev = process.env.NODE_ENV === "development";
const CACHE_FILE = isDev
	? path.resolve(".berlin-footer-cache.json")
	: path.join("/tmp", "berlin-footer-cache.json");
const TTL = isDev ? 60 * 1000 : 24 * 60 * 60 * 1000;

export async function getBerlinFooter(): Promise<{
	html: string;
	timestamp: number;
}> {
	const now = Date.now();

	// ✅ Check if cache exists and is still valid
	if (fs.existsSync(CACHE_FILE)) {
		const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
		if (now - data.timestamp < TTL && data.html) {
			return { html: data.html, timestamp: data.timestamp };
		}
	}

	let html;

	if (!isDev) {
		// 🛫 Fetch fresh footer HTML
		const response = await fetch(
			"https://www.berlin.de/rbmskzl/aktuelles/__i9/std/landesfooter.inc",
		);
		html = await response.text();
	} else {
		// 🔧 Mock or real footer HTML (test version shown here)
		html = `<div><h1>TESTING FOOTER</h1></div>`;
	}

	// ✅ Save to file cache
	try {
		fs.writeFileSync(
			CACHE_FILE,
			JSON.stringify({ html, timestamp: now }),
			"utf-8",
		);
	} catch (err) {
		throw new Error(`Failed to write cache: ${String(err)}`);
	}

	return {
		html,
		timestamp: now,
	};
}
