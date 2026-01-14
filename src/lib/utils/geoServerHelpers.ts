/* eslint-disable complexity */
import { Geometry } from "../types";

type XY = [number, number];

export function bufferedOutlinePointsFromBuilding(
	geom: Geometry,
	bufferMeters = 2,
	stepMeters = 1,
): XY[] {
	if (!geom || (geom.type !== "Polygon" && geom.type !== "MultiPolygon")) {
		return [];
	}

	const polygons =
		geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;

	const points: XY[] = [];
	const seen = new Set<string>();

	const add = (x: number, y: number) => {
		const key = `${x.toFixed(3)},${y.toFixed(3)}`;
		if (!seen.has(key)) {
			seen.add(key);
			points.push([x, y]);
		}
	};

	for (const poly of polygons) {
		if (!Array.isArray(poly) || !Array.isArray(poly[0])) {
			continue;
		}
		const ring = poly[0];
		if (!ring || ring.length < 2) {
			continue;
		}

		for (let i = 0; i < ring.length - 1; i++) {
			const coord1 = ring[i];
			const coord2 = ring[i + 1];

			if (
				!Array.isArray(coord1) ||
				coord1.length < 2 ||
				typeof coord1[0] !== "number" ||
				typeof coord1[1] !== "number" ||
				!Array.isArray(coord2) ||
				coord2.length < 2 ||
				typeof coord2[0] !== "number" ||
				typeof coord2[1] !== "number"
			) {
				continue;
			}

			const [x1, y1] = coord1;
			const [x2, y2] = coord2;

			const dx = x2 - x1;
			const dy = y2 - y1;
			const len = Math.hypot(dx, dy);
			if (len === 0) {
				continue;
			}

			const nx = -dy / len;
			const ny = dx / len;

			const steps = Math.max(1, Math.floor(len / stepMeters));
			for (let s = 0; s <= steps; s++) {
				const t = s / steps;
				const bx = x1 + dx * t;
				const by = y1 + dy * t;

				add(bx + nx * bufferMeters, by + ny * bufferMeters);
			}
		}
	}

	return points;
}

function isValidNumberString(value: string): boolean {
	if (value.trim() === "") {
		return false;
	}
	return !Number.isNaN(Number(value));
}

const heavyRainLevelsMap: Record<string, string> = {
	"> 0,5 - 1,0 m": "100",
	"> 0,3 - 0,5 m": "50",
	"> 0,1 - 0,3 m": "30",
	"<= 0,1 m (nicht dargestellt)": "10",
};

export function transformHeavyRainValue(heavyRain: string | null): number {
	if (!heavyRain) {
		return 0;
	}
	if (isValidNumberString(heavyRain)) {
		return Number(heavyRain);
	}
	return Number(heavyRainLevelsMap[heavyRain]) || Number(heavyRain);
}
