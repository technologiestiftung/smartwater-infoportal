/* eslint-disable */
"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { Button, DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import useMobile from "@/lib/utils/useMobile";
import {
	translateHazardLevels,
	getToday,
	translateHazardTags,
	getScreenshotForScenario,
	translateWMSValue,
} from "../utils";
import pdfData from "@/components/Report/pdf.json";
import { drawPDF } from "../pdf";
import { PDFKeys, PDFProps } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { getWMSForBuilding } from "@/server/actions/getHazardData";
import { BuildingWMS } from "@/lib/types";

interface ReportPDFProps {
	skip: string | null;
}

const ReportPDF: FC<ReportPDFProps> = ({ skip }) => {
	const t = useTranslations();
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const makePDFInitializedRef = useRef<boolean>(false);
	const pdfUrlRef = useRef<string | null>(null);
	const {
		currentUserAddress,
		getHazardEntities,
		locationData,
		floodRiskAnswers,
		floodRiskResult,
	} = useStore();
	const hazardEntities = getHazardEntities();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState<string[]>([]);
	const [numberOfPDFImagesToFetch, setNumberOfPDFImagesToFetch] =
		useState<number>(0);
	const [numberOfFetchedPDFImages, setNumberOfFetchedPDFImages] =
		useState<number>(0);
	const isMobile = useMobile();
	const openPDFInNewTab = true;

	const checks = [
		{
			id: "wms",
			text: "Alle Daten errechnet",
			loading: "Daten werden errechnet...",
		},
		{
			id: "images",
			loading: "Warten auf Bilder...",
		},
		{
			id: "pdf",
			text: "PDF erstellt",
			loading: "PDF wird erstellt...",
		},
	];

	const addToPDFKeys: PDFKeys = {
		"{date}": getToday(),
		"{address}": currentUserAddress?.name || "Keine Adresse gefunden",
		"{hazardLevelHeavyRain}": hazardEntities
			? translateHazardLevels(hazardEntities[0].hazardLevel)
			: "Keine Daten",
		"{hazardLevelfloodRisk}": hazardEntities
			? translateHazardLevels(hazardEntities[1].hazardLevel)
			: "Keine Daten",
		"{skip}": !!skip,
		"{isOwner}":
			!!skip ||
			(typeof floodRiskAnswers?.q0?.value === "string" &&
				floodRiskAnswers?.q0?.value?.includes("Owner")),
		"{basementHazardTag}": translateHazardTags(
			floodRiskAnswers?.q1?.value as string,
			"q1",
		),
		"{highBasementHazard}": floodRiskAnswers?.q1?.value === "yesWithWindow",
		"{midBasementHazard}": floodRiskAnswers?.q1?.value === "yesWithoutWindow",
		"{lowBasementHazard}": floodRiskAnswers?.q1?.value === "no",
		"{dontKnowBasementHazard}": floodRiskAnswers?.q1?.value === "noInformation",
		"{basementUsageTag}": translateHazardTags(
			floodRiskAnswers?.q2?.value as string,
			"q2",
		),
		"{noBasementUsageHazard}": !floodRiskAnswers?.q2,
		"{highBasementUsageHazard}": floodRiskAnswers?.q2?.value === "highValue",
		"{midBasementUsageHazard}": floodRiskAnswers?.q2?.value === "lowValue",
		"{backflowPreventionTag}": translateHazardTags(
			floodRiskAnswers?.q3?.value as string,
			"q3",
		),
		"{highBackflowPrevention}":
			floodRiskAnswers?.q3?.value === "no" ||
			floodRiskAnswers?.q3?.value === "noInformation",
		"{midBackflowPrevention}": floodRiskAnswers?.q3?.value === "yesUnknown",
		"{lowBackflowPrevention}": floodRiskAnswers?.q3?.value === "yesGood",
		"{dontKnowBackflowPrevention}": floodRiskAnswers?.q3?.value === "dontKnow",
		"{propertyDrainageTag}": translateHazardTags(
			floodRiskAnswers?.q4?.value as string,
			"q4",
		),
		"{noPropertyDrainageHazard}":
			floodRiskAnswers?.q4?.value === "noInformation",
		"{highPropertyDrainageHazard}": floodRiskAnswers?.q4?.value === "bad",
		"{lowPropertyDrainageHazard}": floodRiskAnswers?.q4?.value === "good",
		"{pastDamagesTag}": translateHazardTags(
			floodRiskAnswers?.q5?.value as string,
			"q5",
		),
		"{noPastDamages}": floodRiskAnswers?.q5?.value === "noInformation",
		"{highPastDamages}": floodRiskAnswers?.q5?.value === "yes",
		"{lowPastDamages}": floodRiskAnswers?.q5?.value === "no",
		"{floodZoneTag}": translateHazardTags(
			floodRiskAnswers?.qA?.value as string,
			"qA",
		),
		"{highFloodZone}": floodRiskAnswers?.qA?.value === "yes",
		"{lowFloodZone}": floodRiskAnswers?.qA?.value === "no",
		"{fluvialFloodTag}": translateHazardTags(
			floodRiskAnswers?.qB?.value as string,
			"qB",
		),
		"{highFluvialFlood}":
			typeof floodRiskAnswers?.qB?.value === "number" &&
			floodRiskAnswers?.qB?.value > 1,
		"{midFluvialFlood}":
			typeof floodRiskAnswers?.qB?.value === "number" &&
			floodRiskAnswers?.qB?.value === 1,
		"{lowFluvialFlood}":
			typeof floodRiskAnswers?.qB?.value === "number" &&
			floodRiskAnswers?.qB?.value === 0,
		"{heavyRainTag}": translateHazardTags(
			floodRiskAnswers?.qC?.value as string,
			"qC",
		),
		"{highHeavyRain}":
			typeof floodRiskAnswers?.qC?.value === "number" &&
			floodRiskAnswers?.qC?.value > 1,
		"{midHeavyRain}":
			typeof floodRiskAnswers?.qC?.value === "number" &&
			floodRiskAnswers?.qC?.value === 1,
		"{lowHeavyRain}":
			typeof floodRiskAnswers?.qC?.value === "number" &&
			floodRiskAnswers?.qC?.value === 0,
		"{basementWithWindows}": floodRiskAnswers?.q1?.value === "yesWithWindow",
		"{basementWithoutWindows}":
			floodRiskAnswers?.q1?.value === "yesWithoutWindow",
	};

	const makePDF = async () => {
		console.log("makePDF 🚀🚀🚀");
		if (!locationData?.found || !locationData.building) {
			return setError(
				"Es wurden leider keine Gebäudedaten gefunden. Also kann das PDF nicht erstellt werden.",
			);
		}

		if (error) {
			setError(null);
		}

		let buildingWMSData: BuildingWMS | null = null;

		try {
			buildingWMSData = await getWMSForBuilding(locationData);
			if (!buildingWMSData) {
				return setError(
					"No building WMS data found, cannot proceed with PDF image fetch",
				);
			}
		} catch (wmsError) {
			return setError("Error fetching WMS data: " + wmsError);
		}

		setDone((prev) => [...prev, "wms"]);

		console.log("buildingWMSData :>> ", buildingWMSData);

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
		const errorUncommonHeavyRain =
			errors?.includes("uncommonHeavyRain") || false;
		const errorExtremeHeavyRain = errors?.includes("extremeHeavyRain") || false;
		const errorFrequentFlood = errors?.includes("frequentFlood") || false;
		const errorAverageFlood = errors?.includes("averageFlood") || false;
		const errorRareFlood = errors?.includes("rareFlood") || false;
		const errorFloodZone = errors?.includes("floodZoneIndex") || false;

		const scenarios: string[] = [
			"SR",
			"HW",
			"heavyRainWidget",
			"fluvialFloodWidget",
		];

		if (!skip) {
			scenarios.push("risk-block");
		}

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

		setNumberOfPDFImagesToFetch(scenarios.length);

		try {
			for (const scenario of scenarios) {
				const { key, blob } = await getScreenshotForScenario(
					scenario,
					locationData,
					hazardEntities,
					floodRiskResult,
					floodRiskAnswers,
				);
				setNumberOfFetchedPDFImages((prev) => prev + 1);
				addToPDFKeys[`#${key}`] = blob;
			}
		} catch (captureError) {
			return setError("Error capturing screenshots: " + captureError);
		}

		setDone((prev) => [...prev, "images"]);

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

		// Draw PDF
		try {
			const pdfBlobCreated = await drawPDF(pdfData as PDFProps, addToPDFKeys);
			if (!pdfBlobCreated?.blob) {
				throw new Error("Failed to create PDF blob.");
			}
			setDone((prev) => [...prev, "pdf"]);
			await new Promise((r) => setTimeout(r, 1500));
			setPdfSizeKB(pdfBlobCreated.sizeInMB);
			setPdfBlob(pdfBlobCreated?.blob);
		} catch (catchError) {
			setError("Error creating PDF: " + catchError);
		}
		makePDFInitializedRef.current = false;
	};

	useEffect(() => {
		if (makePDFInitializedRef.current) {
			return;
		}
		makePDFInitializedRef.current = true;
		makePDF();
	}, []);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper || !pdfBlob) {
			return () => {};
		}

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const clickedButton = target.closest("button");

			if (clickedButton && wrapper.contains(clickedButton)) {
				const url = pdfUrlRef.current;
				if (!url) {
					return;
				}
				if (isMobile || openPDFInNewTab) {
					window.open(url, "_blank", "noopener,noreferrer");
				} else {
					const a = document.createElement("a");
					a.href = url;
					a.download = pdfData.name as string;
					a.click();
				}
			}
		};

		wrapper.addEventListener("click", handleClick);

		return () => {
			wrapper.removeEventListener("click", handleClick);
		};
	}, [pdfBlob]);

	useEffect(() => {
		// cleanup previous url
		if (pdfUrlRef.current) {
			URL.revokeObjectURL(pdfUrlRef.current);
			pdfUrlRef.current = null;
		}

		if (!pdfBlob) {
			return;
		}

		// create a stable url for this blob
		pdfUrlRef.current = URL.createObjectURL(pdfBlob);

		// revoke only when blob changes or component unmounts
		return () => {
			if (pdfUrlRef.current) {
				URL.revokeObjectURL(pdfUrlRef.current);
				pdfUrlRef.current = null;
			}
		};
	}, [pdfBlob]);

	return (
		<>
			{error ? (
				<div className="flex flex-col gap-8 py-8">
					<p className="text-red-600">
						<b>Beim Erstellen des PDFs ist ein Fehler aufgetreten:</b>
						<br />
						{String(error)}
					</p>
					<Button
						onClick={() => {
							setError(null);
							setDone([]);
							makePDF();
						}}
					>
						Erneut probieren
					</Button>
					<div className="divider" />
				</div>
			) : (
				<>
					<div ref={wrapperRef}>
						{pdfBlob ? (
							<DownloadItem
								buttonText={t("floodCheck.reportDownload.button")}
								description={t("floodCheck.reportDownload.description")}
								downloadUrl="#results"
								fileType={t("floodCheck.reportDownload.fileInfo", {
									size: `${pdfSizeKB} MB`,
								})}
								date={getToday()}
								title={t("floodCheck.reportDownload.title")}
							/>
						) : (
							<>
								<div className="flex min-h-[150px] items-center justify-end py-8">
									<div className="flex flex-col gap-2">
										<Spinner
											text="HochwasserCheck Report wird erstellt..."
											position="right"
											size="small"
										/>
										<p className="ml-10 italic">
											*Dies kann einen Moment dauern
										</p>
										<div className="ml-10 flex flex-col gap-2 pt-2">
											{checks.map((check) => {
												const isDone = done.includes(check.id);
												return (
													<div
														className="flex items-center gap-2"
														key={check.id}
													>
														<FontAwesomeIcon
															icon={faCheck}
															className={cn(
																"flex-shrink-0 text-[18px] text-[#22c55e]",
																!isDone && "invisible",
															)}
														/>
														<span className={cn(isDone && "font-bold")}>
															{check.id !== "images"
																? isDone
																	? check.text
																	: check.loading
																: numberOfPDFImagesToFetch === 0
																	? check.loading
																	: `${numberOfFetchedPDFImages} von ${numberOfPDFImagesToFetch} Bildern erstellt`}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								</div>
								<div className="divider" />
							</>
						)}
					</div>
				</>
			)}
		</>
	);
};

export default ReportPDF;
