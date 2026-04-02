import fs from "fs";
import path from "path";
import {
	MapFishJobResponse,
	MapfishOverrides,
	MapFishStatusResponse,
} from "./types";

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadMapfishTemplate() {
	const mapJsonPath = path.join(
		process.cwd(),
		"src",
		"templates",
		"mapfish.json",
	);

	if (!fs.existsSync(mapJsonPath)) {
		throw new Error("mapfishTest.json nicht im templates Ordner gefunden!");
	}

	return JSON.parse(fs.readFileSync(mapJsonPath, "utf-8"));
}

function applyMapPositionOverrides(
	mapfishConfig: Record<string, any>,
	overrides: MapfishOverrides,
) {
	if ("center" in overrides) {
		mapfishConfig.attributes.map.center = overrides.center;
	}
	if ("scale" in overrides) {
		mapfishConfig.attributes.map.scale = overrides.scale;
	}
}

function applyBasemapImageOverride(
	mapfishConfig: Record<string, any>,
	overrides: MapfishOverrides,
) {
	if (!overrides.basemapImageLayer) {
		return;
	}

	const layers = mapfishConfig.attributes.map.layers as Array<
		Record<string, unknown>
	>;
	const basemapIndex = layers.findIndex((layer) => layer.name === "basemap");

	if (basemapIndex < 0) {
		throw new Error(
			"Basemap-Platzhalter 'basemap' fehlt in src/templates/mapfish.json",
		);
	}

	layers[basemapIndex] = overrides.basemapImageLayer;

	console.log(
		"MapFish basemapImageLayer override:",
		JSON.stringify(overrides.basemapImageLayer, null, 2),
	);
}

function assertMapfishEnv() {
	if (!process.env.MAPFISH_PRINT) {
		throw new Error("MAPFISH_PRINT ist nicht gesetzt");
	}

	if (!process.env.MAPFISH_URL) {
		throw new Error("MAPFISH_URL ist nicht gesetzt");
	}
}

async function submitMapfishJob(mapfishConfig: Record<string, any>) {
	console.log("Sende Anfrage an MapFish Print...");
	console.log("MapFish Config:", JSON.stringify(mapfishConfig, null, 2));

	const mfpResponse = await fetch(process.env.MAPFISH_PRINT!, {
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

	return (await mfpResponse.json()) as MapFishJobResponse;
}

async function fetchMapfishJobStatus(fullStatusURL: string, attempts: number) {
	const statusResponse = await fetch(fullStatusURL);
	if (!statusResponse.ok) {
		throw new Error(`Status Check fehlgeschlagen: ${statusResponse.status}`);
	}

	const statusData = (await statusResponse.json()) as MapFishStatusResponse;
	console.log(`MapFish Status (Attempt ${attempts}):`, statusData);
	return statusData;
}

function handleCompletedMapfishStatus(statusData: MapFishStatusResponse) {
	if (statusData.status === "error") {
		throw new Error(
			`MapFish Print Job Fehler: ${statusData.error || "Unbekannter Fehler"}`,
		);
	}
}

async function waitForMapfishJob(jobResponse: MapFishJobResponse) {
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

		const statusData = await fetchMapfishJobStatus(fullStatusURL, attempts);

		if (statusData.done === true) {
			jobCompleted = true;
			handleCompletedMapfishStatus(statusData);
		}
	}

	if (!jobCompleted) {
		throw new Error("MapFish Print Job Timeout nach 30 Sekunden");
	}

	return downloadURL;
}

async function downloadMapfishImage(downloadURL: string) {
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

export async function generateMapfishScreenshot(
	overridesDown?: MapfishOverrides,
) {
	const template = loadMapfishTemplate();

	// optional: shallow merge; for deep changes you can extend this
	const mapfishConfig = {
		...template,
	};

	const overrides = overridesDown ?? {};
	applyMapPositionOverrides(mapfishConfig, overrides);
	applyBasemapImageOverride(mapfishConfig, overrides);
	assertMapfishEnv();
	const jobResponse = await submitMapfishJob(mapfishConfig);
	const downloadURL = await waitForMapfishJob(jobResponse);
	return downloadMapfishImage(downloadURL);
}
