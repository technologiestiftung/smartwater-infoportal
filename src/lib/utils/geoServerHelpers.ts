/* eslint-disable */
import { Geometry } from "../types";

type XY = [number, number];

type GeoJSONMultiPolygon = {
	type: "MultiPolygon";
	coordinates: XY[][][];
};

type Ring = XY[];
type PolygonCoords = Ring[];
type MultiPolygonCoords = PolygonCoords[];

const isXY = (v: any): v is XY =>
	Array.isArray(v) &&
	v.length >= 2 &&
	typeof v[0] === "number" &&
	typeof v[1] === "number";

const isRing = (v: any): v is Ring => Array.isArray(v) && v.every(isXY);

const isPolygonCoords = (v: any): v is PolygonCoords =>
	Array.isArray(v) && v.length > 0 && v.every(isRing);

const isMultiPolygonCoords = (v: any): v is MultiPolygonCoords =>
	Array.isArray(v) && v.length > 0 && v.every(isPolygonCoords);

function ensureClosed(ring: XY[]): XY[] {
	if (ring.length < 2) return ring;
	const a = ring[0];
	const b = ring[ring.length - 1];
	if (a[0] === b[0] && a[1] === b[1]) return ring;
	return [...ring, [a[0], a[1]]];
}

function normalize(x: number, y: number): XY {
	const len = Math.hypot(x, y);
	if (!len) return [0, 0];
	return [x / len, y / len];
}

const leftNormal = (dx: number, dy: number): XY => normalize(-dy, dx);

/**
 * Returns a buffered outline as MultiPolygon.
 * - Keeps SAME number of polygons as input.
 * - Uses only OUTER ring (holes ignored) to keep it simple/stable.
 * - miterLimit reduces "spikes" at sharp corners.
 */
export function bufferedOutlineMultiPolygonFromBuilding(
	geom: Geometry,
	bufferMeters = 2,
	miterLimit = 1, // higher = pointier corners; lower = more clipped
): GeoJSONMultiPolygon {
	if (!geom || (geom.type !== "Polygon" && geom.type !== "MultiPolygon")) {
		return { type: "MultiPolygon", coordinates: [] };
	}

	const polygons: MultiPolygonCoords =
		geom.type === "Polygon"
			? isPolygonCoords(geom.coordinates)
				? [geom.coordinates]
				: []
			: isMultiPolygonCoords(geom.coordinates)
				? geom.coordinates
				: [];

	const out: XY[][][] = [];

	for (const poly of polygons) {
		if (!Array.isArray(poly) || poly.length === 0 || !Array.isArray(poly[0]))
			continue;

		let ring = poly[0].filter(isXY);
		ring = ensureClosed(ring);

		if (ring.length < 4) continue;

		const n = ring.length - 1;
		const buffered: XY[] = [];

		for (let i = 0; i < n; i++) {
			const prev = ring[(i - 1 + n) % n];
			const curr = ring[i];
			const next = ring[(i + 1) % n];

			const v1x = curr[0] - prev[0];
			const v1y = curr[1] - prev[1];
			const v2x = next[0] - curr[0];
			const v2y = next[1] - curr[1];

			const n1 = leftNormal(v1x, v1y);
			const n2 = leftNormal(v2x, v2y);

			let ax = n1[0] + n2[0];
			let ay = n1[1] + n2[1];
			let a = normalize(ax, ay);

			if (a[0] === 0 && a[1] === 0) a = n2;

			const dot = a[0] * n2[0] + a[1] * n2[1];
			const denom = Math.max(0.2, dot);
			let miterLen = bufferMeters / denom;

			const maxMiter = bufferMeters * miterLimit;
			if (miterLen > maxMiter) miterLen = maxMiter;

			buffered.push([curr[0] + a[0] * miterLen, curr[1] + a[1] * miterLen]);
		}

		buffered.push([buffered[0][0], buffered[0][1]]);

		out.push([buffered]);
	}

	return { type: "MultiPolygon", coordinates: out };
}

export async function getWFSFeatureInfo(
	x25833: number,
	y25833: number,
	base: string,
	layer: string,
	propertyKey?: string,
): Promise<any | null> {
	const buffer = 0.5;
	try {
		const bbox = [
			x25833 - buffer,
			y25833 - buffer,
			x25833 + buffer,
			y25833 + buffer,
		].join(",");

		const url = new URL(`https://gdi.berlin.de/services/wfs/${base}`);

		url.searchParams.set("SERVICE", "WFS");
		url.searchParams.set("VERSION", "2.0.0");
		url.searchParams.set("REQUEST", "GetFeature");
		url.searchParams.set("TYPENAMES", layer);
		url.searchParams.set("OUTPUTFORMAT", "application/json");
		url.searchParams.set("COUNT", "1");
		url.searchParams.set("MAXFEATURES", "1");
		url.searchParams.set("SRSNAME", "EPSG:25833");
		url.searchParams.set("BBOX", bbox);

		const response = await fetch(url.toString());
		if (!response.ok) return null;

		const json = await response.json();
		if (!json?.features?.length) return null;

		const feature = json.features[0];

		if (propertyKey) {
			return feature.properties?.[propertyKey] ?? null;
		}

		return feature.properties ?? feature;
	} catch (err) {
		console.error("WFS fetch failed:", err);
		return null;
	}
}
