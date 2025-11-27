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

const filterOutAddressResults = (item: any, results: any[]): boolean => {
	if (item.type === "house" && item.type !== "secondary_link") {
		return true;
	}
	if (!results.some((otherItem: any) => otherItem.type === "house")) {
		if (item.type === "station") {
			return true;
		} else if (item.addresstype === "road") {
			return true;
		}
	}
	return false;
};

export const addLabelToAddressResults = (results: any[]): any[] => {
	if (!results || results.length === 0) {
		return [];
	}
	let dataWithLabels = results.filter((item) =>
		filterOutAddressResults(item, results),
	);

	if (dataWithLabels.length === 0) {
		const findMostImportant = results.reduce((best, current) => {
			const bestImportance =
				typeof best.importance === "number" ? best.importance : -Infinity;
			const currentImportance =
				typeof current.importance === "number" ? current.importance : -Infinity;

			return currentImportance > bestImportance ? current : best;
		});
		dataWithLabels = [findMostImportant];
	}

	dataWithLabels = dataWithLabels.map((item: any) => {
		const addr = item.address;

		const street =
			addr.road ||
			addr.pedestrian ||
			addr.cycleway ||
			addr.footway ||
			addr.square ||
			"";
		const number = addr.house_number || "";
		const postcode = addr.postcode || "";
		const city = addr.city || addr.town || addr.village || addr.hamlet || "";

		const label =
			`${street}${number ? " " + number : ""}, ${postcode} ${city}`.trim();

		return {
			...item,
			label,
			hasHouseNumber: number !== "",
		};
	});

	const seen = new Set();
	const collectResults = dataWithLabels.filter((item: any) => {
		if (seen.has(item.label)) {
			return false;
		}
		seen.add(item.label);
		return true;
	});
	return collectResults;
};
