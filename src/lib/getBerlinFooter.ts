import fs from "fs";
import path from "path";

const CACHE_FILE = path.join("/tmp", "berlin-footer-cache.json"); // ✅ Writable in serverless
const isDev = false; // or use: process.env.NODE_ENV === 'development'
const TTL = isDev ? 60 * 1000 : 24 * 60 * 60 * 1000; // 60s for testing, 24h in prod

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

	// 🛫 Fetch fresh footer HTML
	const response = await fetch(
		"https://www.berlin.de/rbmskzl/aktuelles/__i9/std/landesfooter.inc",
	);
	const html = await response.text();

	// 🔧 Mock or real footer HTML (test version shown here)
	// const html = `<div><h1>TESTING FOOTER</h1></div>`;

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
