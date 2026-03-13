/* eslint-disable */
"use client";

import pdfData from "@/components/Report/pdf.json";
import { calculateRiskLevel, cn } from "@/lib/utils";
import useMobile from "@/lib/utils/useMobile";
import useStore from "@/store/defaultStore";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { push } from "@socialgouv/matomo-next";
import { Button, DownloadItem, Spinner } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import {
	translateHazardLevels,
	getToday,
	translateHazardTags,
	getScreenshotForScenario,
	translateWMSValue,
} from "../utils";
import { drawPDF } from "../pdf";
import { PDFKeys, PDFProps } from "../types";
import { GeoServerClient } from "@/lib/geoserverClient";
import { Building, BuildingWMS, RiskFactor } from "@/lib/types";
import floodRiskConfig from "@/config/floodRiskConfig.json";

interface ReportPDFProps {
	skip: string | null;
}

const geoServerClient = new GeoServerClient();

const ReportPDF: FC<ReportPDFProps> = ({ skip }) => {
	const t = useTranslations("floodCheck");
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const makePDFInitializedRef = useRef<boolean>(false);
	const pdfUrlRef = useRef<string | null>(null);
	const { locationData, getHazardEntities, floodRiskAnswers, floodRiskResult } =
		useStore();
	const hazardEntities = getHazardEntities();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const [pdfOpenFailed, setPdfOpenFailed] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState<string[]>([]);
	const [numberOfPDFImagesToFetch, setNumberOfPDFImagesToFetch] =
		useState<number>(0);
	const [numberOfFetchedPDFImages, setNumberOfFetchedPDFImages] =
		useState<number>(0);
	const isDev = process.env.NODE_ENV === "development";
	const isMobile = useMobile();

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
		"{name}": `HochwasserCheck-Berlin-${getToday(true)}.pdf`,
		"{address}": locationData?.building?.name || "Keine Adresse gefunden",
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
	};

	const addWMSDataToPDFKeys = async (
		building: Building,
	): Promise<BuildingWMS> => {
		const isThereABasement = !floodRiskAnswers["q1"]?.value
			.toString()
			.startsWith("no");

		const defaultRiskFactors: RiskFactor[] = floodRiskConfig.riskFactors
			.map((factor) => ({
				id: factor.id,
				riskLevel: calculateRiskLevel(
					factor.questionId,
					floodRiskAnswers,
					hazardEntities,
				),
				translationKey: factor.translationKey,
				hasInfo: factor.id === "floodplain",
			}))
			.filter((factor) => {
				if (!floodRiskAnswers) return false;
				if (factor.id === "basementUsage" && !isThereABasement) {
					return false;
				}
				return true;
			});

		addToPDFKeys["{noBasementUsageHazard}"] = !floodRiskAnswers?.q2;
		addToPDFKeys["{noPropertyDrainageHazard}"] =
			floodRiskAnswers?.q4?.value === "noInformation";
		addToPDFKeys["{noPastDamages}"] =
			floodRiskAnswers?.q5?.value === "noInformation";

		for (const [index, factor] of defaultRiskFactors.entries()) {
			const factorName = t(factor.translationKey);
			const factorDescription = t(
				factor.translationKey.replace("title", factor.riskLevel),
			);
			let questionID = `q${index + 1}`;
			if (isThereABasement) {
				if (index === 5) questionID = "qA";
				if (index === 6) questionID = "qB";
				if (index === 7) questionID = "qC";
			} else {
				if (index === 4) questionID = "qA";
				if (index === 5) questionID = "qB";
				if (index === 6) questionID = "qC";
			}
			addToPDFKeys[`{${factor.id}Tag}`] = translateHazardTags(
				floodRiskAnswers?.[questionID]?.value as string,
				questionID,
			);
			addToPDFKeys[`{${factor.id}Name}`] = factorName;
			addToPDFKeys[`{${factor.id}Description}`] = factorDescription;
		}

		const buildingWMSData = await geoServerClient.getBuildingWMS(building);

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
		} = buildingWMSData;

		console.log("buildingWMSData :>> ", buildingWMSData);

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
		const errorExtremeHeavyRain = errors?.includes("extremeHeavyRain") || false;
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
			!errorFloodZone && !building.floodZoneIndex;
		addToPDFKeys["{hasFloodZoneData}"] =
			!errorFloodZone && !!building.floodZoneIndex;

		return buildingWMSData;
	};

	const makePDF = async () => {
		const { found, building } = locationData || {};
		if (!found || !building) {
			return setError(
				"Es wurden leider keine Gebäudedaten gefunden. Also kann das PDF nicht erstellt werden.",
			);
		}

		const {
			errors,
			hasHeavyRainHazardMap,
			isInExtremeRainHazardMap,
			frequentFloodMax,
			averageFloodMax,
			rareFloodMax,
		} = await addWMSDataToPDFKeys(building);

		const errorRareHeavyRain = errors?.includes("rareHeavyRain") || false;
		const errorUncommonHeavyRain =
			errors?.includes("uncommonHeavyRain") || false;
		const errorExtremeHeavyRain = errors?.includes("extremeHeavyRain") || false;
		const errorFrequentFlood = errors?.includes("frequentFlood") || false;
		const errorAverageFlood = errors?.includes("averageFlood") || false;
		const errorRareFlood = errors?.includes("rareFlood") || false;
		const errorFloodZone = errors?.includes("floodZoneIndex") || false;

		setDone((prev) => [...prev, "wms"]);

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
		} finally {
			makePDFInitializedRef.current = false;
		}
	};

	const openPdfViewer = (testing: boolean | undefined) => {
		if (testing && isDev) {
			setError(
				"Das PDF konnte nicht geöffnet werden. Bitte erlauben Sie Pop-ups für diese Seite und versuchen Sie es erneut.",
			);
			setPdfOpenFailed(true);
			return;
		}
		const viewer = window.open("/pdf-viewer", "_blank");
		if (!viewer) {
			setError(
				"Das PDF konnte nicht geöffnet werden. Bitte erlauben Sie Pop-ups für diese Seite und versuchen Sie es erneut.",
			);
			setPdfOpenFailed(true);
			return;
		}

		const payload = {
			type: "PDF_PAYLOAD",
			blob: pdfBlob,
			title: addToPDFKeys["{name}"] || "Report-HochwasserCheck-Berlin.pdf",
		};

		const origin = window.location.origin;

		// The new tab may not be ready immediately, so retry briefly.
		const send = () => {
			try {
				viewer.postMessage(payload, origin);
			} catch {
				// ignore and retry
			}
		};

		send();
		const interval = window.setInterval(send, 200);
		window.setTimeout(() => window.clearInterval(interval), 3000);
	};

	useEffect(() => {
		if (makePDFInitializedRef.current) {
			return;
		}
		makePDFInitializedRef.current = true;
		makePDF();
	}, []);

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
							if (pdfOpenFailed) {
								setPdfOpenFailed(false);
								openPdfViewer(false);
							} else {
								setDone([]);
								makePDF();
							}
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
								buttonText={t("reportDownload.button")}
								description={t("reportDownload.description")}
								fileType={t("reportDownload.fileInfo", {
									size: `${pdfSizeKB} MB`,
								})}
								date={getToday()}
								title={t("reportDownload.title")}
								onClickDownloadItem={() => {
									push([
										"trackEvent",
										"report",
										"download",
										"Report herunterladen",
									]);
									if (isMobile) {
										const url = pdfUrlRef.current;
										if (!url) {
											return openPdfViewer(isDev);
										}
										return window.open(url, "_blank", "noopener,noreferrer");
									}
									openPdfViewer(isDev);
								}}
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
