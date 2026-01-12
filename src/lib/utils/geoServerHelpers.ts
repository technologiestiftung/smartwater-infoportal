/* eslint-disable no-nested-ternary */
import { Geometry } from "../types";

type XY = [number, number];

export function bufferedPointsFromBuilding(
	geom: Geometry,
	bufferMeters = 2,
): XY[] {
	if (!geom || !geom.coordinates) {
		return [];
	}

	const points: XY[] = [];
	const seen = new Set<string>();

	const addPoint = (x: number, y: number) => {
		const key = `${x.toFixed(3)},${y.toFixed(3)}`;
		if (!seen.has(key)) {
			seen.add(key);
			points.push([x, y]);
		}
	};

	const offsets: XY[] = [
		[0, 0],
		[bufferMeters, 0],
		[-bufferMeters, 0],
		[0, bufferMeters],
		[0, -bufferMeters],
		[bufferMeters, bufferMeters],
		[bufferMeters, -bufferMeters],
		[-bufferMeters, bufferMeters],
		[-bufferMeters, -bufferMeters],
	];

	const polygons =
		geom.type === "Polygon"
			? [geom.coordinates]
			: geom.type === "MultiPolygon"
				? geom.coordinates
				: [];

	for (const poly of polygons) {
		if (!Array.isArray(poly)) {
			continue;
		}
		for (const ring of poly) {
			if (!Array.isArray(ring)) {
				continue;
			}
			for (const coord of ring) {
				if (
					!Array.isArray(coord) ||
					coord.length < 2 ||
					typeof coord[0] !== "number" ||
					typeof coord[1] !== "number"
				) {
					continue;
				}

				const x = coord[0];
				const y = coord[1];

				for (const [dx, dy] of offsets) {
					addPoint(x + dx, y + dy);
				}
			}
		}
	}

	return points;
}

export function valuesByCount(values: string[]): Record<number, string[]> {
	const counts: Record<string, number> = {};
	const result: Record<number, string[]> = {};

	// Count occurrences
	for (const v of values) {
		counts[v] = (counts[v] ?? 0) + 1;
	}

	// Group by count
	for (const [value, count] of Object.entries(counts)) {
		if (!result[count]) {
			result[count] = [];
		}
		result[count].push(value);
	}

	return result;
}
