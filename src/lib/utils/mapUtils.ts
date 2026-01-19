/* eslint-disable @typescript-eslint/no-explicit-any */

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

export const getHeightClass = (isMobile: boolean, fullScreenMap: boolean) => {
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

export const checkNumber = (str: string): boolean => {
	return !isNaN(Number(str)) && str.trim() !== "";
};

const STREET_HINT =
	/\b(strasse|straße|str\.|weg|allee|platz|ring|damm|gasse|ufer|chaussee|promenade|boulevard|zeile|hof|steig|pfad)\b/i;

export function looksLikeAGermanStreet(input: string): boolean {
	const q = input.trim();

	// must contain a housenumber
	if (!/\b\d+[a-zA-Z]?\b/.test(q)) {
		return false;
	}

	// must contain letters
	if (!/[a-zA-ZäöüÄÖÜß]/.test(q)) {
		return false;
	}

	// must contain at least one street hint
	if (!STREET_HINT.test(q)) {
		return false;
	}

	return true;
}
