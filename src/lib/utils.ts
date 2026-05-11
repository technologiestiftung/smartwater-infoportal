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
		return "none";
	}
	if (value === 1) {
		return "low";
	}
	if (value === 2) {
		return "moderate";
	}
	if (value === 3) {
		return "high";
	}
	if (value >= 4) {
		return "severe";
	}
	return "low";
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
	const { value } = answer;
	if (questionId === "qA") {
		const fluvialFloodEntity = hazardEntities?.find(
			(entity) => entity.name === "fluvialFlood",
		)?.subHazardLevel;
		if (fluvialFloodEntity === "yes") {
			return "high";
		}
		return "low";
	}
	if (questionId === "qB" || questionId === "qC") {
		if (+value <= 1) return "low";
		if (+value <= 2) return "moderate";
		if (+value >= 3) return "high";
	}
	if (questionId === "q1") {
		// q1 => basement
		if (value === "yesWithWindow") return "high";
		if (value === "yesWithoutWindow") return "moderate";
		if (value === "no") return "low";
	}
	if (questionId === "q2") {
		// q2 => basementUsage
		if (value === "highValue") {
			return "high";
		} else if (value === "lowValue") {
			return "moderate";
		}
	}
	if (questionId === "q3") {
		// q3 => backflowProtection
		if (value === "no") return "high";
		if (value === "yesUnknown") return "moderate";
		if (value === "yesGood") return "low";
	}
	if (questionId === "q4") {
		// q4 => propertyDrainage
		if (value === "bad") return "high";
		if (value === "good") return "low";
	}
	if (questionId === "q5") {
		// q5 => pastDamages
		if (value === "yes") return "high";
		if (value === "no") return "low";
	}

	return "dontKnow";
};
