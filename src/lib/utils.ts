import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FloodRiskAnswers, HazardLevel, RiskLevel } from "./types";
import { HazardEntity } from "@/utils/storeUtils";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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

export function formatGermanTimestamp(timestamp: number): string {
	return new Date(timestamp).toLocaleString("de-DE", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: "Europe/Berlin",
	});
}

/**
 * Maps GeoServer hazard scale (0-4) to HazardLevel enum
 * @param value - Numeric hazard value from GeoServer (0-4)
 * @returns HazardLevel string
 */
export function mapScaleToHazardLevel(value: number): HazardLevel {
	if (value === 0) {
		return "low";
	}
	if (value === 1) {
		return "moderate";
	}
	if (value === 2) {
		return "high";
	}
	if (value >= 3) {
		return "severe";
	}
	return "low"; // fallback
}

export function fixMojibake(text: string): string {
	try {
		const bytes = Uint8Array.from(text, (c) => c.charCodeAt(0));
		return new TextDecoder("utf-8").decode(bytes);
	} catch {
		return text;
	}
}

type Extent = [number, number, number, number];

const getExtentWidth = (extent: Extent) => extent[2] - extent[0];
const getExtentHeight = (extent: Extent) => extent[3] - extent[1];

export function getSafeFitExtent(
	geometry: any,
	opts?: {
		ratioThreshold?: number;
		maxSizeMeters?: number;
	},
) {
	const ratioThreshold = opts?.ratioThreshold ?? 10;
	const maxSizeMeters = opts?.maxSizeMeters ?? 20_000;

	if (!geometry) return null;

	if (geometry?.getType?.() === "MultiPolygon") {
		const allExtent = geometry.getExtent() as Extent;
		const allW = getExtentWidth(allExtent);
		const allH = getExtentHeight(allExtent);

		const poly = geometry.getPolygon(0);
		if (!poly) return allExtent;

		const firstExtent = poly.getExtent() as Extent;
		const firstW = getExtentWidth(firstExtent);
		const firstH = getExtentHeight(firstExtent);

		const wRatio = firstW > 0 ? allW / firstW : Infinity;
		const hRatio = firstH > 0 ? allH / firstH : Infinity;

		const tooBigAbs = allW > maxSizeMeters || allH > maxSizeMeters;
		const tooBigRel = wRatio > ratioThreshold || hRatio > ratioThreshold;

		return tooBigAbs || tooBigRel ? firstExtent : allExtent;
	}

	return geometry.getExtent();
}

export const calculateRiskLevel = (
	questionId: string,
	floodRiskAnswers: FloodRiskAnswers | null,
	hazardEntities: HazardEntity[] | null,
): RiskLevel => {
	if (!floodRiskAnswers || !floodRiskAnswers[questionId]) {
		return "unknown";
	}

	const answer = floodRiskAnswers[questionId];
	const score = answer.score || 0;
	if (questionId === "qA") {
		const fluvialFloodEntity = hazardEntities?.find(
			(entity) => entity.name === "fluvialFlood",
		)?.subHazardLevel;
		if (fluvialFloodEntity === "yes") {
			return "high";
		}
		return "low";
	}
	if (answer?.value === "noInformation") {
		return "dontKnow";
	}
	if (questionId === "qB" && answer?.value === 0) {
		return "low";
	}
	if (questionId === "q2") {
		if (answer?.value === "highValue") {
			return "high";
		} else if (answer?.value === "lowValue") {
			return "moderate";
		}
	}
	if (score >= 2) {
		return "low";
	}
	if (score >= 0 || (questionId === "q1" && score === -1)) {
		return "moderate";
	}
	return "high";
};
