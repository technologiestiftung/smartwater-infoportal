/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Results from "@/components/Results";
import RiskAnalysis from "@/components/RiskAnalysis";
import { useHash } from "@/hooks/useHash";
import { Button } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import useStore from "@/store/defaultStore";
import {
	getHazardData,
	getWMSForBuilding,
} from "@/server/actions/getHazardData";
import CheckBlock from "@/components/CheckBlock";
import { PDFKeys } from "@/components/Report/types";
import {
	getScreenshotForScenario,
	translateWMSValue,
} from "@/components/Report/utils";

export default function FloodCheckClient() {
	const t = useTranslations();
	const hash = useHash();
	const router = useRouter();
	const { currentUserAddress, setLocationData, setPDFKeys, clearPDFKeys } =
		useStore();
	const searchParams = useSearchParams();
	const getCheckFromURL = searchParams.get("skip") === "true";
	const makePDFImagesInitializedRef = useRef<boolean>(false);

	const getLocationDataAndStartPDFImageFetch = async () => {
		if (!currentUserAddress?.lat || !currentUserAddress?.lon) {
			return;
		}
		clearPDFKeys();
		try {
			const longitude = parseFloat(currentUserAddress.lon);
			const latitude = parseFloat(currentUserAddress.lat);
			const locationData = await getHazardData(longitude, latitude);
			setLocationData(locationData);
			if (!locationData.found || !locationData.building) {
				return;
			}
			const buildingWMSData = await getWMSForBuilding(locationData);

			if (!buildingWMSData) {
				return console.error(
					"No WMS data found for building, cannot fetch PDF images",
				);
			}

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

			const scenarios = ["SR", "HW"];

			if (
				!!locationData?.building?.floodZoneIndex &&
				locationData?.building?.floodZoneIndex > 0
			) {
				// scenarios.push("HW");
				scenarios.push("FLOOD_ZONE");
			}
			if (!!hasHeavyRainHazardMap) {
				scenarios.push("SRGK_RARE_HEAVY_RAIN");
				scenarios.push("SRGK_UNCOMMON_HEAVY_RAIN");
			} else if (!hasHeavyRainHazardMap) {
				scenarios.push("SRHK_UNCOMMON_HEAVY_RAIN");
			}
			if (isInExtremeRainHazardMap) {
				scenarios.push("SRGK_EXTREME_HEAVY_RAIN");
			} else {
				scenarios.push("SRHK_EXTREME_HEAVY_RAIN");
			}
			if (!!frequentFloodMax) {
				scenarios.push("FREQUENT_FLOOD");
			}
			if (!!averageFloodMax) {
				scenarios.push("AVERAGE_FREQUENT_FLOOD");
			}
			if (!!rareFloodMax) {
				scenarios.push("RARE_FREQUENT_FLOOD");
			}

			setPDFKeys({
				wmsDataLoaded: true,
			});

			try {
				for (const scenario of scenarios) {
					const { key, blob } = await getScreenshotForScenario(
						scenario,
						locationData,
					);
					addToPDFKeys[`#${key}`] = blob;
				}
			} catch (captureError) {
				console.error("Error capturing screenshots: " + captureError);
				return;
			}

			// Rare Heavy Rain
			const errorRareHeavyRain = errors?.includes("rareHeavyRain") || false;
			addToPDFKeys["{showRareHeavyRain}"] = !!rareHeavyRainMax;
			addToPDFKeys["{rareHeavyRainMax}"] = translateWMSValue(rareHeavyRainMax);
			addToPDFKeys["{rareHeavyRainAverage}"] = translateWMSValue(
				rareHeavyRainAverage,
				"",
			);
			addToPDFKeys["{errorRareHeavyRain}"] = errorRareHeavyRain;

			// Uncommon Heavy Rain
			const errorUncommonHeavyRain =
				errors?.includes("uncommonHeavyRain") || false;
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
			addToPDFKeys["{errorUncommonHeavyRain}"] =
				errors?.includes("uncommonHeavyRain") || false;

			// Extreme Heavy Rain
			const errorExtremeHeavyRain =
				errors?.includes("extremeHeavyRain") || false;
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
			const errorFrequentFlood = errors?.includes("frequentFlood") || false;
			addToPDFKeys["{errorFrequentFlood}"] = errorFrequentFlood;
			addToPDFKeys["{hasNoFrequentFloodData}"] =
				!errorFrequentFlood && !frequentFloodMax;
			addToPDFKeys["{hasFrequentFloodData}"] =
				!errorFrequentFlood && !!frequentFloodMax;
			addToPDFKeys["{frequentFloodMax}"] = translateWMSValue(frequentFloodMax);
			addToPDFKeys["{frequentFloodAverage}"] =
				translateWMSValue(frequentFloodAverage);

			// Average Flood
			const errorAverageFlood = errors?.includes("averageFlood") || false;
			addToPDFKeys["{errorAverageFlood}"] = errorAverageFlood;
			addToPDFKeys["{hasNoAverageFloodData}"] =
				!errorAverageFlood && !averageFloodMax;
			addToPDFKeys["{hasAverageFloodData}"] =
				!errorAverageFlood && !!averageFloodMax;
			addToPDFKeys["{averageFloodMax}"] = translateWMSValue(averageFloodMax);
			addToPDFKeys["{averageFloodAverage}"] =
				translateWMSValue(averageFloodAverage);

			// Rare Flood
			const errorRareFlood = errors?.includes("rareFlood") || false;
			addToPDFKeys["{errorRareFlood}"] = errorRareFlood;
			addToPDFKeys["{hasNoRareFloodData}"] = !errorRareFlood && !rareFloodMax;
			addToPDFKeys["{hasRareFloodData}"] = !errorRareFlood && !!rareFloodMax;
			addToPDFKeys["{rareFloodMax}"] = translateWMSValue(rareFloodMax);
			addToPDFKeys["{rareFloodAverage}"] = translateWMSValue(rareFloodAverage);

			// Flood Zone
			const errorFloodZone = errors?.includes("floodZoneIndex") || false;
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
		} catch (error) {
			console.error("Error capturing scenario map screenshot:", error);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line no-extra-boolean-cast
		if (!!hash) {
			setTimeout(() => window.scrollTo(0, 0), 100);
		}
	}, [hash]);

	useEffect(() => {
		if (!hash) {
			const check = useStore.getState().currentUserAddress;
			if (!check) {
				router.push("/#hochwasser-check");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hash]);

	useEffect(() => {
		if (makePDFImagesInitializedRef.current) {
			return;
		}
		makePDFImagesInitializedRef.current = true;
		getLocationDataAndStartPDFImageFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
			{hash === "questionnaire" ? (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() => router.push("/hochwasser-check")}
						variant="back-link"
					>
						{t("floodCheck.navigation.back")}
					</Button>
					<div className="flex w-full flex-col gap-4">
						<div className="flex items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
						</div>
						<RiskAnalysis />
					</div>
				</>
			) : hash === "results" ? (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() =>
							router.push(
								getCheckFromURL
									? "/hochwasser-check"
									: "/hochwasser-check#questionnaire",
							)
						}
						variant="back-link"
					>
						{getCheckFromURL
							? t("floodCheck.results.navigation.back")
							: t("floodCheck.results.navigation.backQuestionnaire")}
					</Button>
					<div className="flex w-full flex-col gap-4">
						<div className="flex flex-wrap items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
							<h1 className="">{t("floodCheck.results.title")}</h1>
							<Results />
						</div>
					</div>
				</>
			) : (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() => {
							router.push("/");
						}}
						variant="back-link"
					>
						{t("common.backToStart")}
					</Button>
					<div className="flex w-full flex-col gap-4">
						<h1 className="">{t("floodCheck.pageTitle")}</h1>
						<p className="">{t("floodCheck.start.description")}</p>
						<CheckBlock
							onSubmit={(goTo) => {
								const skip = goTo === "no";
								if (skip) {
									router.push("/hochwasser-check?skip=true#results");
								} else {
									router.push("/hochwasser-check#questionnaire");
								}
							}}
						/>
					</div>
				</>
			)}
		</div>
	);
}
