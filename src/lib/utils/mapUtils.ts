/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scenario } from "@/types/map";

export function getEpsgFromCrs(crs: string) {
	const epsgMatch = crs.match(/EPSG[:/](\d+)/i);
	return epsgMatch ? `EPSG:${epsgMatch[1]}` : crs;
}

export const getScale = (map: any) => {
	const view = map.getView();
	const resolution = view.getResolution();

	if (!resolution) {
		return null;
	}

	const projection = view.getProjection();
	const metersPerUnit = projection.getMetersPerUnit() || 1;

	return (resolution * metersPerUnit) / 0.00028;
};

export const getHeightClass = (
	isMobile: boolean | null,
	fullScreenMap: boolean,
) => {
	if (!isMobile && !fullScreenMap) {
		return "max-h-[calc((65vh-60px-46px-46px)/2)]";
	}
	if (!isMobile && fullScreenMap) {
		return "max-h-[calc((100vh-60px-46px-46px)/2)]";
	}
	return "max-h-[calc(40vh-46px-46px)]";
};

export const getWidthClass = (fullScreenMap: boolean) => {
	if (fullScreenMap) {
		return "w-[33vw]";
	}
	return "w-[370px]";
};

export const containsNumber = (str: string): boolean => {
	if (!str) {
		return false;
	}
	return /\d/.test(str);
};

export function extractGermanZipCode(query: string): string | null {
	if (!query) {
		return null;
	}
	const match = query.match(/\b(?!00)\d{5}\b/);
	return match ? match[0] : null;
}

export const getScenarioDomId = (scenario: Scenario) =>
	`map-root-${scenario.toLowerCase().replace(/_/g, "-")}`;
