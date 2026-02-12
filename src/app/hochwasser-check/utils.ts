/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFKeys } from "@/components/Report/types";
import {
	getScreenshotForScenario,
	translateWMSValue,
} from "@/components/Report/utils";
import { LocationData } from "@/lib/types";
import { getWMSForBuilding } from "@/server/actions/getHazardData";

const getWMSForBuildingAndStartPDFImageFetch = async (
	locationData: LocationData,
	setPDFKeys: any,
	addToNumberOfFetchedPDFImages: any,
	withError?: boolean,
) => {
	if (withError) {
		throw new Error("Upps, I did it again");
	}

	if (
		!locationData ||
		!locationData.building ||
		!setPDFKeys ||
		!addToNumberOfFetchedPDFImages
	) {
		throw new Error(
			"No location data found, cannot proceed with PDF image fetch",
		);
	}
	const buildingWMSData = await getWMSForBuilding(locationData);
	if (!buildingWMSData) {
		throw new Error(
			"No building WMS data found, cannot proceed with PDF image fetch",
		);
	}

	console.log("buildingWMSData :>> ", buildingWMSData);

	const addToPDFKeys: PDFKeys = {};

	const {
		hasHeavyRainHazardMap,
		rareHeavyRainMax,
		rareHeavyRainAverage,
		uncommonHeavyRainMax,
		uncommonHeavyRainAverage,
		extremeHeavyRainMax,
		extremeHeavyRainAverage,
		frequentFloodMax,
		frequentFloodAverage,
		averageFloodMax,
		averageFloodAverage,
		rareFloodMax,
		rareFloodAverage,
		errors,
		isInExtremeRainHazardMap,
	} = buildingWMSData;

	const errorRareHeavyRain = errors?.includes("rareHeavyRain") || false;
	const errorUncommonHeavyRain = errors?.includes("uncommonHeavyRain") || false;
	const errorExtremeHeavyRain = errors?.includes("extremeHeavyRain") || false;
	const errorFrequentFlood = errors?.includes("frequentFlood") || false;
	const errorAverageFlood = errors?.includes("averageFlood") || false;
	const errorRareFlood = errors?.includes("rareFlood") || false;
	const errorFloodZone = errors?.includes("floodZoneIndex") || false;

	const scenarios: string[] = []; // ["SR", "HW"];

	if (
		!!locationData?.building?.floodZoneIndex &&
		locationData?.building?.floodZoneIndex > 0
	) {
		if (!errorFloodZone) {
			scenarios.push("FLOOD_ZONE");
		}
	}
	if (!!hasHeavyRainHazardMap) {
		if (!errorRareHeavyRain) {
			scenarios.push("SRGK_RARE_HEAVY_RAIN");
		}
		if (!errorUncommonHeavyRain) {
			scenarios.push("SRGK_UNCOMMON_HEAVY_RAIN");
		}
	} else if (!hasHeavyRainHazardMap) {
		if (!errorUncommonHeavyRain) {
			scenarios.push("SRHK_UNCOMMON_HEAVY_RAIN");
		}
	}
	if (!errorExtremeHeavyRain) {
		if (isInExtremeRainHazardMap) {
			scenarios.push("SRGK_EXTREME_HEAVY_RAIN");
		} else {
			scenarios.push("SRHK_EXTREME_HEAVY_RAIN");
		}
	}
	if (!!frequentFloodMax && !errorFrequentFlood) {
		scenarios.push("FREQUENT_FLOOD");
	}
	if (!!averageFloodMax && !errorAverageFlood) {
		scenarios.push("AVERAGE_FREQUENT_FLOOD");
	}
	if (!!rareFloodMax && !errorRareFlood) {
		scenarios.push("RARE_FREQUENT_FLOOD");
	}

	console.log("scenarios :>> ", scenarios);

	setPDFKeys({
		wmsDataLoaded: true,
	});

	addToNumberOfFetchedPDFImages(scenarios.length);

	if (scenarios.length > 0) {
		try {
			for (const scenario of scenarios) {
				const { key, blob } = await getScreenshotForScenario(
					scenario,
					locationData,
				);
				addToNumberOfFetchedPDFImages(undefined);
				addToPDFKeys[`#${key}`] = blob;
			}
		} catch (captureError) {
			throw new Error("Error capturing screenshots: " + captureError);
		}
	}
	// Rare Heavy Rain
	addToPDFKeys["{showRareHeavyRain}"] = !!rareHeavyRainMax;
	addToPDFKeys["{rareHeavyRainMax}"] = translateWMSValue(rareHeavyRainMax);
	addToPDFKeys["{rareHeavyRainAverage}"] = translateWMSValue(
		rareHeavyRainAverage,
		"",
	);
	addToPDFKeys["{errorRareHeavyRain}"] = errorRareHeavyRain;

	// Uncommon Heavy Rain
	addToPDFKeys["{hasSrgkUncommonHeavyRainMap}"] =
		!errorUncommonHeavyRain && !!hasHeavyRainHazardMap;
	addToPDFKeys["{hasSrhkUncommonHeavyRainMap}"] =
		!errorUncommonHeavyRain && !hasHeavyRainHazardMap;
	addToPDFKeys["{uncommonHeavyRainMax}"] =
		translateWMSValue(uncommonHeavyRainMax);
	addToPDFKeys["{uncommonHeavyRainAverage}"] = translateWMSValue(
		uncommonHeavyRainAverage,
		"",
	);
	addToPDFKeys["{errorUncommonHeavyRain}"] = errorUncommonHeavyRain;

	// Extreme Heavy Rain
	addToPDFKeys["{hasSrgkExtremeHeavyRainMap}"] =
		!errorExtremeHeavyRain &&
		hasHeavyRainHazardMap === "isInExtremeRainHazardMap";
	addToPDFKeys["{hasSrhkExtremeHeavyRainMap}"] =
		!errorExtremeHeavyRain &&
		hasHeavyRainHazardMap !== "isInExtremeRainHazardMap";
	addToPDFKeys["{extremeHeavyRainMax}"] =
		translateWMSValue(extremeHeavyRainMax);
	addToPDFKeys["{extremeHeavyRainAverage}"] = translateWMSValue(
		extremeHeavyRainAverage,
		"",
	);
	addToPDFKeys["{errorExtremeHeavyRain}"] = errorExtremeHeavyRain;

	// Frequent Flood
	addToPDFKeys["{errorFrequentFlood}"] = errorFrequentFlood;
	addToPDFKeys["{hasNoFrequentFloodData}"] =
		!errorFrequentFlood && !frequentFloodMax;
	addToPDFKeys["{hasFrequentFloodData}"] =
		!errorFrequentFlood && !!frequentFloodMax;
	addToPDFKeys["{frequentFloodMax}"] = translateWMSValue(frequentFloodMax);
	addToPDFKeys["{frequentFloodAverage}"] =
		translateWMSValue(frequentFloodAverage);

	// Average Flood
	addToPDFKeys["{errorAverageFlood}"] = errorAverageFlood;
	addToPDFKeys["{hasNoAverageFloodData}"] =
		!errorAverageFlood && !averageFloodMax;
	addToPDFKeys["{hasAverageFloodData}"] =
		!errorAverageFlood && !!averageFloodMax;
	addToPDFKeys["{averageFloodMax}"] = translateWMSValue(averageFloodMax);
	addToPDFKeys["{averageFloodAverage}"] =
		translateWMSValue(averageFloodAverage);

	// Rare Flood
	addToPDFKeys["{errorRareFlood}"] = errorRareFlood;
	addToPDFKeys["{hasNoRareFloodData}"] = !errorRareFlood && !rareFloodMax;
	addToPDFKeys["{hasRareFloodData}"] = !errorRareFlood && !!rareFloodMax;
	addToPDFKeys["{rareFloodMax}"] = translateWMSValue(rareFloodMax);
	addToPDFKeys["{rareFloodAverage}"] = translateWMSValue(rareFloodAverage);

	// Flood Zone
	addToPDFKeys["{errorFloodZone}"] = errorFloodZone;
	addToPDFKeys["{hasNoFloodZoneData}"] =
		!errorFloodZone && !locationData.building.floodZoneIndex;
	addToPDFKeys["{hasFloodZoneData}"] =
		!errorFloodZone && !!locationData.building.floodZoneIndex;

	addToPDFKeys["{finishedFirstFetch}"] = true;

	setPDFKeys({
		wmsDataLoaded: true,
		...addToPDFKeys,
	});
	return "✅";
};

export default getWMSForBuildingAndStartPDFImageFetch;
