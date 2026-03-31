import fs from "fs";
import path from "path";

type MapFishJobResponse = {
	ref?: string;
	statusURL?: string;
	downloadURL?: string;
};

type MapFishStatusResponse = {
	done?: boolean;
	status?: string;
	error?: string;
};

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateMapfishScreenshot(
	overridesDown?: Record<string, unknown>,
) {
	const mapJsonPath = path.join(
		process.cwd(),
		"src",
		"templates",
		"mapfish.json",
	);

	if (!fs.existsSync(mapJsonPath)) {
		throw new Error("mapfishTest.json nicht im templates Ordner gefunden!");
	}

	const template = JSON.parse(fs.readFileSync(mapJsonPath, "utf-8"));

	// optional: shallow merge; for deep changes you can extend this
	const mapfishConfig = {
		...template,
	};

	const overrides = overridesDown ?? {};

	// configure center
	if ("center" in overrides) {
		mapfishConfig.attributes.map.center = overrides.center;
	}
	if ("scale" in overrides) {
		mapfishConfig.attributes.map.scale = overrides.scale;
	}

	// add layers

	// add center && padding

	if (!process.env.MAPFISH_PRINT) {
		throw new Error("MAPFISH_PRINT ist nicht gesetzt");
	}

	if (!process.env.MAPFISH_URL) {
		throw new Error("MAPFISH_URL ist nicht gesetzt");
	}

	console.log("Sende Anfrage an MapFish Print...");
	// console.log("MapFish Config:", JSON.stringify(mapfishConfig, null, 2));

	const mfpResponse = await fetch(process.env.MAPFISH_PRINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(mapfishConfig),
	});

	if (!mfpResponse.ok) {
		const errorText = await mfpResponse.text();
		throw new Error(
			`MapFish Print Fehler: ${mfpResponse.status} - ${errorText}`,
		);
	}

	const jobResponse = (await mfpResponse.json()) as MapFishJobResponse;

	const { ref, statusURL, downloadURL } = jobResponse;
	if (!ref || !statusURL || !downloadURL) {
		throw new Error("MapFish Print Response unvollständig");
	}

	const fullStatusURL = `${process.env.MAPFISH_URL}${statusURL}`;

	let attempts = 0;
	const maxAttempts = 30;
	let jobCompleted = false;

	while (!jobCompleted && attempts < maxAttempts) {
		await sleep(1000);
		attempts++;

		const statusResponse = await fetch(fullStatusURL);
		if (!statusResponse.ok) {
			throw new Error(`Status Check fehlgeschlagen: ${statusResponse.status}`);
		}

		const statusData = (await statusResponse.json()) as MapFishStatusResponse;
		console.log(`MapFish Status (Attempt ${attempts}):`, statusData);

		if (statusData.done === true) {
			jobCompleted = true;

			if (statusData.status === "error") {
				throw new Error(
					`MapFish Print Job Fehler: ${statusData.error || "Unbekannter Fehler"}`,
				);
			}
		}
	}

	if (!jobCompleted) {
		throw new Error("MapFish Print Job Timeout nach 30 Sekunden");
	}

	const fullDownloadURL = `${process.env.MAPFISH_URL}${downloadURL}`;
	const imageResponse = await fetch(fullDownloadURL);

	if (!imageResponse.ok) {
		throw new Error(`Bild Download fehlgeschlagen: ${imageResponse.status}`);
	}

	const imageArrayBuffer = await imageResponse.arrayBuffer();
	const imageBuffer = Buffer.from(imageArrayBuffer);

	if (imageBuffer.length === 0) {
		throw new Error("MapFish Print hat leeres Bild zurückgegeben");
	}

	return imageBuffer;
}
