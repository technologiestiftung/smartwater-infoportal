"use client";

import Config from "@/config/config";
import services from "@/config/services.json";
import { getMapfishCenterAndScale } from "@/lib/geometry";
import { MVTEncoder } from "@geoblocks/print";
import type { Geometry } from "geojson";
import { applyStyle } from "ol-mapbox-style";
import VectorTileLayer from "ol/layer/VectorTile";
import { unByKey } from "ol/Observable";
import { get as getProjection, transformExtent } from "ol/proj";
import { register } from "ol/proj/proj4";
import type VectorTileSource from "ol/source/VectorTile";
import proj4 from "proj4";
import { useState } from "react";

type BasemapServiceConfig = {
	id: string;
	url: string;
	vtStyles?: Array<{
		url: string;
		defaultStyle?: boolean;
	}>;
};

type ImageLayerOverride = {
	type: "image";
	baseURL: string;
	extent: [number, number, number, number];
	opacity: number;
	imageFormat: "image/png";
	name: string;
};

function getBasemapConfig(): BasemapServiceConfig {
	const basemap = (services as BasemapServiceConfig[]).find(
		(service) => service.id === "basemap",
	);

	if (!basemap) {
		throw new Error("Basemap Konfiguration nicht gefunden");
	}

	return basemap;
}

function getBasemapStyleUrl(basemap: BasemapServiceConfig): string {
	const styleUrl =
		basemap.vtStyles?.find((style) => style.defaultStyle)?.url ||
		basemap.vtStyles?.[0]?.url;

	if (!styleUrl) {
		throw new Error("Basemap-Style nicht gefunden");
	}

	return styleUrl;
}

function toAbsoluteStyleUrl(styleUrl: string): string {
	if (/^https?:\/\//i.test(styleUrl)) {
		return styleUrl;
	}

	if (typeof window === "undefined") {
		return styleUrl;
	}

	return new URL(styleUrl, window.location.origin).toString();
}

function ensurePrintProjectionsRegistered() {
	if (getProjection("EPSG:25833") && getProjection("EPSG:3857")) {
		return;
	}

	for (const [name, def] of Config.namedProjections) {
		proj4.defs(name, def);
	}

	register(proj4);
}

async function loadStyleJson(styleUrl: string) {
	const styleResponse = await fetch(styleUrl);
	if (!styleResponse.ok) {
		throw new Error("Basemap-Style konnte nicht geladen werden");
	}

	return (await styleResponse.json()) as {
		sources?: Record<string, unknown>;
	};
}

function computePrintExtents(center25833: [number, number], scale: number) {
	ensurePrintProjectionsRegistered();

	const mapWidthMeters = scale * (297 / 1000);
	const mapHeightMeters = scale * (210 / 1000);

	const extent25833: [number, number, number, number] = [
		center25833[0] - mapWidthMeters / 2,
		center25833[1] - mapHeightMeters / 2,
		center25833[0] + mapWidthMeters / 2,
		center25833[1] + mapHeightMeters / 2,
	];

	const extent3857 = transformExtent(
		extent25833,
		"EPSG:25833",
		"EPSG:3857",
	) as [number, number, number, number];

	return { extent25833, extent3857 };
}

function buildMvtLayer() {
	return new VectorTileLayer({
		declutter: true,
	});
}

async function encodeBasemapLayer(
	layer: VectorTileLayer,
	extent3857: [number, number, number, number],
	canvasSize: [number, number],
) {
	const resolution = (extent3857[2] - extent3857[0]) / canvasSize[0];
	console.log("encodeBasemapLayer - resolution:", resolution);
	console.log("encodeBasemapLayer - extent3857:", extent3857);
	console.log("encodeBasemapLayer - canvasSize:", canvasSize);
	console.log("encodeBasemapLayer - layer opacity:", layer.getOpacity());

	const source = layer.getSource();
	console.log("encodeBasemapLayer - source state:", source?.getState());
	console.log("encodeBasemapLayer - source tileGrid:", source?.getTileGrid());

	const styleFunc = layer.getStyleFunction();
	console.log("encodeBasemapLayer - styleFunction exists:", !!styleFunc);

	MVTEncoder.useImmediateAPI = false;
	const encoder = new MVTEncoder();

	console.log("About to call encodeMVTLayer...");
	const result = await encoder.encodeMVTLayer({
		layer,
		tileResolution: resolution,
		styleResolution: resolution,
		printExtent: extent3857,
		canvasSize,
		outputFormat: "image/png",
	});

	console.log("encodeMVTLayer result:", result);
	console.log(
		"encodeMVTLayer result length:",
		Array.isArray(result) ? result.length : "not array",
	);
	if (Array.isArray(result) && result.length > 0) {
		console.log("First result item keys:", Object.keys(result[0]));
		console.log("First result item baseURL length:", result[0].baseURL?.length);
	}

	return result;
}

async function waitForVectorTileSourceReady(source: VectorTileSource) {
	const state = source.getState();
	if (state === "ready") {
		return;
	}
	if (state === "error") {
		throw new Error("VectorTile source ist in Fehlerzustand");
	}

	await new Promise<void>((resolve, reject) => {
		const timeout = window.setTimeout(() => {
			unByKey(listenerKey);
			reject(new Error("VectorTile source wurde nicht rechtzeitig bereit"));
		}, 10000);

		const listenerKey = source.on("change", () => {
			const currentState = source.getState();
			if (currentState === "ready") {
				window.clearTimeout(timeout);
				unByKey(listenerKey);
				resolve();
			}
			if (currentState === "error") {
				window.clearTimeout(timeout);
				unByKey(listenerKey);
				reject(new Error("VectorTile source ist in Fehlerzustand"));
			}
		});

		// Re-check after attaching the listener to avoid missing the transition
		const stateAfterListen = source.getState();
		if (stateAfterListen === "ready") {
			window.clearTimeout(timeout);
			unByKey(listenerKey);
			resolve();
		} else if (stateAfterListen === "error") {
			window.clearTimeout(timeout);
			unByKey(listenerKey);
			reject(new Error("VectorTile source ist in Fehlerzustand"));
		}
	});
}

function alignLayerPropertyForGeoblocks(source: VectorTileSource) {
	const privateFormatSource = source as unknown as {
		format_?: { layerName_?: string };
	};

	// ol-mapbox-style uses "mvt:layer", geoblocks parses PBF with default "layer".
	if (privateFormatSource.format_?.layerName_ === "mvt:layer") {
		privateFormatSource.format_.layerName_ = "layer";
	}
}

function getEncodedBaseUrl(result: Array<{ baseURL?: string }>) {
	if (!Array.isArray(result) || result.length === 0 || !result[0]?.baseURL) {
		throw new Error("Basemap Rendering mit MVTEncoder fehlgeschlagen");
	}

	return result[0].baseURL;
}

async function buildBasemapImageLayer(
	center25833: [number, number],
	scale: number,
): Promise<ImageLayerOverride> {
	const basemap = getBasemapConfig();
	const styleUrl = toAbsoluteStyleUrl(getBasemapStyleUrl(basemap));

	console.log("buildBasemapImageLayer - basemap config:", basemap);
	console.log("buildBasemapImageLayer - styleUrl:", styleUrl);

	// Keep extent math aligned with getMapfishCenterAndScale assumptions.
	const { extent25833, extent3857 } = computePrintExtents(center25833, scale);
	console.log("buildBasemapImageLayer - extent25833:", extent25833);
	console.log("buildBasemapImageLayer - extent3857:", extent3857);

	const dpi = 300;
	const canvasWidth = Math.round((297 / 25.4) * dpi);
	const canvasHeight = Math.round((210 / 25.4) * dpi);
	const canvasSize: [number, number] = [canvasWidth, canvasHeight];
	console.log("buildBasemapImageLayer - canvasSize:", canvasSize);

	const layer = buildMvtLayer();
	console.log("Layer created, about to apply style...");

	const styleJson = await loadStyleJson(styleUrl);
	console.log(
		"Style JSON loaded, sources:",
		Object.keys(styleJson.sources || {}),
	);

	await applyStyle(layer, styleUrl);
	console.log("Style applied to layer");

	if (!layer.getSource()) {
		throw new Error("Basemap-Quelle konnte nicht aus dem Style erzeugt werden");
	}

	const source = layer.getSource() as VectorTileSource;
	console.log("VectorTile source state before wait:", source.getState());
	console.log("VectorTile source URL:", source.getUrls?.());
	console.log(
		"VectorTile source tileUrlFunction:",
		!!source.getTileUrlFunction?.(),
	);

	await waitForVectorTileSourceReady(source);
	console.log("VectorTile source state after wait:", source.getState());
	console.log(
		"VectorTile source projection:",
		source.getProjection()?.getCode(),
	);
	alignLayerPropertyForGeoblocks(source);

	const result = await encodeBasemapLayer(layer, extent3857, canvasSize);
	const baseURL = getEncodedBaseUrl(result as Array<{ baseURL?: string }>);
	console.log("Encoded baseURL created, length:", baseURL.length);

	return {
		type: "image",
		baseURL,
		extent: extent25833,
		opacity: 1,
		imageFormat: "image/png",
		name: "basemap-mvt",
	};
}

export default function Screenshot() {
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [basemapPreviewUrl, setBasemapPreviewUrl] = useState<string | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);

	async function handleGenerate() {
		try {
			setLoading(true);
			setError(null);
			setBasemapPreviewUrl(null);

			const geometry: Geometry = {
				type: "MultiPolygon",
				coordinates: [
					[
						[
							[391937.56, 5826168.161],
							[391949.627, 5826176.46],
							[391960.389, 5826160.827],
							[391948.302, 5826152.548],
							[391937.56, 5826168.161],
						],
					],
				],
			};

			const testingValue = getMapfishCenterAndScale(geometry);
			const basemapImageLayer = await buildBasemapImageLayer(
				testingValue.center,
				testingValue.scale,
			);
			setBasemapPreviewUrl(basemapImageLayer.baseURL);
			console.log("basemapImageLayer :>> ", basemapImageLayer);

			console.log("testingValue :>> ", testingValue);

			const res = await fetch("/api/mapfish", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...testingValue, basemapImageLayer }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(
					data?.error || "Screenshot konnte nicht erzeugt werden",
				);
			}

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			setImageUrl(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unbekannter Fehler");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="border p-6">
			<button
				onClick={handleGenerate}
				disabled={loading}
				className="cursor-pointer"
			>
				{loading ? "Erzeuge Screenshot..." : "Mapfish Screenshot erstellen"}
			</button>

			{error && <p style={{ color: "red" }}>{error}</p>}

			{imageUrl && (
				<div style={{ marginTop: 24 }}>
					<p>MapFish Ergebnis</p>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={imageUrl}
						alt="MapFish Screenshot"
						style={{ maxWidth: "100%" }}
					/>
				</div>
			)}

			{basemapPreviewUrl && (
				<div style={{ marginTop: 24 }}>
					<p>Geoblocks Basemap Preview</p>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={basemapPreviewUrl}
						alt="Geoblocks Basemap Preview"
						style={{ maxWidth: "100%" }}
					/>
				</div>
			)}
		</div>
	);
}
