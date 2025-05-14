import fs from "fs";
import path from "path";

const CACHE_FILE = path.join("/tmp", "berlin-footer-cache.json"); // ✅ Writable in serverless
const isDev = true; // or use: process.env.NODE_ENV === 'development'
const TTL = isDev ? 60 * 1000 : 24 * 60 * 60 * 1000; // 60s for testing, 24h in prod

export function formatCurrentGermanTimestampWithSeconds(): string {
	return new Date().toLocaleString("de-DE", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: "Europe/Berlin",
	});
}

export async function getBerlinFooter(): Promise<string> {
	const now = Date.now();

	// ✅ Check if cache exists and is still valid
	if (fs.existsSync(CACHE_FILE)) {
		const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
		if (now - data.timestamp < TTL && data.html) {
			return data.html;
		}
	}

	// Fetch fresh footer HTML
	//   const response = await fetch(
	//     'https://www.berlin.de/rbmskzl/aktuelles/__i9/std/landesfooter.inc'
	//   );
	//   const html = await response.text();

	// 🔧 Mock or real footer HTML (test version shown here)
	const html = `<div><h2>TESTING FOOTER ${formatCurrentGermanTimestampWithSeconds()}</h2></div>`;

	// ✅ Save to file cache
	fs.writeFileSync(
		CACHE_FILE,
		JSON.stringify({ timestamp: now, html }),
		"utf-8",
	);

	// Save to file cache
	fs.writeFileSync(
		CACHE_FILE,
		JSON.stringify({ timestamp: now, html }),
		"utf-8",
	);

	return html;
}
