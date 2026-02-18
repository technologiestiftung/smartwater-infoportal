import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HazardLevel } from "./types";

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
