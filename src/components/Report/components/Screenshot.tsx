"use client";

import Config from "@/config/config";
import services from "@/config/services.json";
import { getMapfishCenterAndScale } from "@/lib/geometry";
import {
	BasemapServiceConfig,
	ImageLayerOverride,
	PrintState,
} from "@/lib/types";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const PRINT_DPI = 300;
const PAPER_WIDTH_MM = 297;
const PAPER_HEIGHT_MM = 210;

const TEST_GEOMETRY: Geometry = {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBasemapStyleUrl(): string {
	const basemap = (services as BasemapServiceConfig[]).find(
		(s) => s.id === "basemap",
	);
	const styleUrl =
		basemap?.vtStyles?.find((s) => s.defaultStyle)?.url ??
		basemap?.vtStyles?.[0]?.url;

	if (!styleUrl) throw new Error("Basemap-Style nicht gefunden");
	return styleUrl;
}

function toAbsoluteUrl(url: string): string {
	return new URL(url, window.location.origin).toString();
}

function ensureProjectionsRegistered() {
	if (getProjection("EPSG:25833") && getProjection("EPSG:3857")) return;
	for (const [name, def] of Config.namedProjections) proj4.defs(name, def);
	register(proj4);
}

function buildPrintExtents(center25833: [number, number], scale: number) {
	ensureProjectionsRegistered();

	const halfW = (scale * PAPER_WIDTH_MM) / 1000 / 2;
	const halfH = (scale * PAPER_HEIGHT_MM) / 1000 / 2;

	const extent25833: [number, number, number, number] = [
		center25833[0] - halfW,
		center25833[1] - halfH,
		center25833[0] + halfW,
		center25833[1] + halfH,
	];

	const extent3857 = transformExtent(
		extent25833,
		"EPSG:25833",
		"EPSG:3857",
	) as [number, number, number, number];

	const canvasSize: [number, number] = [
		Math.round((PAPER_WIDTH_MM / 25.4) * PRINT_DPI),
		Math.round((PAPER_HEIGHT_MM / 25.4) * PRINT_DPI),
	];

	return { extent25833, extent3857, canvasSize };
}

async function waitForSource(source: VectorTileSource): Promise<void> {
	const state = source.getState();
	if (state === "ready") return;
	if (state === "error") {
		throw new Error("VectorTile source ist in Fehlerzustand");
	}

	return new Promise<void>((resolve, reject) => {
		let finished = false;

		const timeout = window.setTimeout(() => {
			cleanupError(new Error("VectorTile source Timeout"));
		}, 10000);

		const key = source.on("change", () => {
			const s = source.getState();
			if (s === "ready") {
				cleanupSuccess();
			} else if (s === "error") {
				cleanupError(new Error("VectorTile source ist in Fehlerzustand"));
			}
		});

		function cleanupBase() {
			if (finished) return;
			finished = true;
			window.clearTimeout(timeout);
			unByKey(key);
		}

		function cleanupSuccess() {
			cleanupBase();
			resolve();
		}

		function cleanupError(err: Error) {
			cleanupBase();
			reject(err);
		}

		// Re-check after attaching to avoid missing transition
		const s = source.getState();
		if (s === "ready") {
			cleanupSuccess();
		} else if (s === "error") {
			cleanupError(new Error("VectorTile source ist in Fehlerzustand"));
		}
	});
}

function fixLayerNameForGeoblocks(source: VectorTileSource) {
	const fmt = (source as unknown as { format_?: { layerName_?: string } })
		.format_;
	if (fmt?.layerName_ === "mvt:layer") fmt.layerName_ = "layer";
}

async function buildBasemapImageLayer(
	center25833: [number, number],
	scale: number,
): Promise<ImageLayerOverride> {
	const styleUrl = toAbsoluteUrl(getBasemapStyleUrl());
	const { extent25833, extent3857, canvasSize } = buildPrintExtents(
		center25833,
		scale,
	);

	const layer = new VectorTileLayer({ declutter: true });
	await applyStyle(layer, styleUrl);

	const source = layer.getSource() as VectorTileSource;
	if (!source) throw new Error("Basemap-Quelle konnte nicht erzeugt werden");

	await waitForSource(source);
	fixLayerNameForGeoblocks(source);

	const resolution = (extent3857[2] - extent3857[0]) / canvasSize[0];
	MVTEncoder.useImmediateAPI = false;
	const result = await new MVTEncoder().encodeMVTLayer({
		layer,
		tileResolution: resolution,
		styleResolution: resolution,
		printExtent: extent3857,
		canvasSize,
		outputFormat: "image/png",
	});

	const baseURL = (result as Array<{ baseURL?: string }>)[0]?.baseURL;
	if (!baseURL)
		throw new Error("Basemap Rendering mit MVTEncoder fehlgeschlagen");

	return {
		type: "image",
		baseURL,
		extent: extent25833,
		opacity: 1,
		imageFormat: "image/png",
		name: "basemap-mvt",
	};
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_STATE: PrintState = {
	loading: false,
	imageUrl: null,
	basemapPreviewUrl: null,
	error: null,
};

export default function Screenshot() {
	const [state, setState] = useState<PrintState>(INITIAL_STATE);

	function patch(partial: Partial<PrintState>) {
		setState((prev) => ({ ...prev, ...partial }));
	}

	async function handleGenerate() {
		patch({ loading: true, error: null, basemapPreviewUrl: null });

		try {
			const { center, scale } = getMapfishCenterAndScale(TEST_GEOMETRY);
			const basemapImageLayer = await buildBasemapImageLayer(center, scale);

			patch({ basemapPreviewUrl: basemapImageLayer.baseURL });

			const res = await fetch("/api/mapfish", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ center, scale, basemapImageLayer }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(
					data?.error ?? "Screenshot konnte nicht erzeugt werden",
				);
			}

			const url = URL.createObjectURL(await res.blob());
			patch({ imageUrl: url });
		} catch (err) {
			patch({
				error: err instanceof Error ? err.message : "Unbekannter Fehler",
			});
		} finally {
			patch({ loading: false });
		}
	}

	const { loading, imageUrl, basemapPreviewUrl, error } = state;

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
