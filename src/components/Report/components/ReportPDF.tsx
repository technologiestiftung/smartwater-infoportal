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
import { Building, RiskFactor } from "@/lib/types";
import floodRiskConfig from "@/config/floodRiskConfig.json";

interface ReportPDFProps {
	skip: string | null;
}

interface BuildingWMS {
	hasHeavyRainHazardMap: boolean;
	hasExtremeRainHazardMap: boolean;
	frequentFloodMax: number | null;
	averageFloodMax: number | null;
	rareFloodMax: number | null;
}

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
	const isLocalhost =
		typeof window !== "undefined" && window.location.hostname === "localhost";
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
		"{basementWithWindows}": floodRiskAnswers?.q1?.value === "yesWithWindow",
		"{basementWithoutWindows}":
			floodRiskAnswers?.q1?.value === "yesWithoutWindow",
		"{backflowProtectionIsGood}":
			!!skip || floodRiskAnswers?.q3?.value === "yesGood",
	};

	const addWMSDataToPDFKeys = (building: Building): BuildingWMS => {
		const isThereABasement =
			!skip && !floodRiskAnswers["q1"]?.value.toString().startsWith("no");

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

		addToPDFKeys["{noBasementUsageHazard}"] =
			!floodRiskAnswers?.q2 || floodRiskAnswers?.q2?.value === "noInformation";
		addToPDFKeys["{noPropertyDrainageHazard}"] =
			floodRiskAnswers?.q4?.value === "noInformation";
		addToPDFKeys["{noPastDamages}"] =
			floodRiskAnswers?.q5?.value === "noInformation";

		const filteredFloodRiskAnswers = Object.fromEntries(
			Object.entries(floodRiskAnswers || {}).filter(([key]) => {
				if (key === "q2" && !isThereABasement) {
					return false;
				}
				return true;
			}),
		);

		const questionIdByIndexWithBasement: Record<number, string> = {
			0: "q1",
			1: "q2",
			2: "q3",
			3: "q4",
			4: "q5",
			5: "qA",
			6: "qB",
			7: "qC",
		};

		const questionIdByIndexWithoutBasement: Record<number, string> = {
			0: "q1",
			1: "q3",
			2: "q4",
			3: "q5",
			4: "qA",
			5: "qB",
			6: "qC",
		};

		const getQuestionId = (index: number) => {
			return isThereABasement
				? questionIdByIndexWithBasement[index]
				: questionIdByIndexWithoutBasement[index];
		};

		for (const [index, factor] of defaultRiskFactors.entries()) {
			const questionID = getQuestionId(index);
			addToPDFKeys[`{${factor.id}Tag}`] = translateHazardTags(
				filteredFloodRiskAnswers?.[questionID]?.value as string,
				questionID,
			);
			addToPDFKeys[`{${factor.id}Name}`] = t(factor.translationKey);
			addToPDFKeys[`{${factor.id}Description}`] = t(
				factor.translationKey.replace("title", factor.riskLevel),
			);
		}

		addToPDFKeys[`{isThereABasement}`] = isThereABasement;

		const buildingWMSData: BuildingWMS = {
			hasHeavyRainHazardMap: false,
			hasExtremeRainHazardMap: false,
			frequentFloodMax: null,
			averageFloodMax: null,
			rareFloodMax: null,
		};

		for (const [key, value] of Object.entries(building)) {
			if (
				key.startsWith("srgk_") &&
				value &&
				typeof value === "number" &&
				value > 0
			) {
				buildingWMSData.hasHeavyRainHazardMap = true;
			}
			if (
				key.startsWith("srgk_e") &&
				value &&
				typeof value === "number" &&
				value > 0
			) {
				buildingWMSData.hasExtremeRainHazardMap = true;
			}
		}

		// Rare Heavy Rain => Starkregengefahrenkarte "Seltenes Ereignis"
		addToPDFKeys["{hasSrgkRareHeavyRainMap}"] =
			!!building.srgk_smax || !!building.srgk_smean;
		addToPDFKeys["{rareHeavyRainMax}"] = translateWMSValue(
			building.srgk_smax || "",
		);
		addToPDFKeys["{rareHeavyRainAverage}"] = translateWMSValue(
			building.srgk_smean || "",
		);

		// Uncommon Heavy Rain => Starkregen "Außergewöhnliches Ereignis"
		addToPDFKeys["{hasSrgkUncommonHeavyRainMap}"] =
			!!buildingWMSData.hasHeavyRainHazardMap;
		addToPDFKeys["{hasSrhkUncommonHeavyRainMap}"] =
			!buildingWMSData.hasHeavyRainHazardMap;
		addToPDFKeys["{uncommonHeavyRainMax}"] = translateWMSValue(
			building.srgk_amax || building.srhk_amax || "",
		);
		addToPDFKeys["{uncommonHeavyRainAverage}"] = translateWMSValue(
			building.srgk_amean || building.srhk_amean || "",
		);

		// Extreme Heavy Rain => Starkregen "Extremes Ereignis"
		addToPDFKeys["{hasSrgkExtremeHeavyRainMap}"] =
			!!buildingWMSData.hasExtremeRainHazardMap;
		addToPDFKeys["{hasSrhkExtremeHeavyRainMap}"] =
			!buildingWMSData.hasExtremeRainHazardMap;
		addToPDFKeys["{extremeHeavyRainMax}"] = translateWMSValue(
			building.srgk_emax || building.srhk_emax || "",
		);
		addToPDFKeys["{extremeHeavyRainAverage}"] = translateWMSValue(
			building.srgk_emean || building.srhk_emean || "",
		);

		// Frequent Flood
		addToPDFKeys["{hasNoFrequentFloodData}"] =
			!building.hw_hval_ma || !building.hw_hval_mi;
		addToPDFKeys["{hasFrequentFloodData}"] = !!building.hw_hval_ma;
		addToPDFKeys["{frequentFloodMax}"] = translateWMSValue(building.hw_hval_ma);
		addToPDFKeys["{frequentFloodMinimum}"] = translateWMSValue(
			building.hw_hval_mi,
		);
		buildingWMSData.frequentFloodMax = building.hw_hval_ma ?? null;

		// Average Flood
		addToPDFKeys["{hasNoAverageFloodData}"] =
			!building.hw_mva_max || !building.hw_mva_min;
		addToPDFKeys["{hasAverageFloodData}"] = !!building.hw_mva_max;
		addToPDFKeys["{averageFloodMax}"] = translateWMSValue(building.hw_mva_max);
		addToPDFKeys["{averageFloodMinimum}"] = translateWMSValue(
			building.hw_mva_min,
		);
		buildingWMSData.averageFloodMax = building.hw_mva_max ?? null;

		// Rare Flood
		addToPDFKeys["{hasNoRareFloodData}"] =
			!building.hw_sval_ma || !building.hw_sval_mi;
		addToPDFKeys["{hasRareFloodData}"] = !!building.hw_sval_ma;
		addToPDFKeys["{rareFloodMax}"] = translateWMSValue(building.hw_sval_ma);
		addToPDFKeys["{rareFloodMinimum}"] = translateWMSValue(building.hw_sval_mi);
		buildingWMSData.rareFloodMax = building.hw_sval_ma ?? null;

		// Flood Zone
		addToPDFKeys["{hasNoFloodZoneData}"] = !building.floodZoneIndex;
		addToPDFKeys["{hasFloodZoneData}"] = !!building.floodZoneIndex;

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
			hasHeavyRainHazardMap,
			hasExtremeRainHazardMap,
			frequentFloodMax,
			averageFloodMax,
			rareFloodMax,
		} = addWMSDataToPDFKeys(building);

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
			scenarios.push("FLOOD_ZONE");
		}
		if (!!hasHeavyRainHazardMap) {
			scenarios.push("SRGK_RARE_HEAVY_RAIN");
			scenarios.push("SRGK_UNCOMMON_HEAVY_RAIN");
		} else if (!hasHeavyRainHazardMap) {
			scenarios.push("SRHK_UNCOMMON_HEAVY_RAIN");
		}
		if (hasExtremeRainHazardMap) {
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

		setNumberOfPDFImagesToFetch(scenarios.length);

		try {
			const results = await Promise.all(
				scenarios.map(async (scenario) => {
					const result = await getScreenshotForScenario(
						scenario,
						locationData,
						hazardEntities,
						floodRiskResult,
						floodRiskAnswers,
					);

					setNumberOfFetchedPDFImages((prev) => prev + 1);

					return result;
				}),
			);

			results.forEach(({ key, blob }) => {
				addToPDFKeys[`#${key}`] = blob;
			});
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

	const downloadPDF = () => {
		if (!pdfBlob) return;

		const url = pdfUrlRef.current;
		if (!url) {
			setError(
				"Das PDF konnte nicht heruntergeladen werden. Bitte versuchen Sie es erneut.",
			);
			return;
		}
		const a = document.createElement("a");
		a.href = url;
		a.download = "Report-HochwasserCheck-Berlin.pdf";
		a.click();
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
							<>
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
								{isLocalhost && (
									<div id="pdf-ready">
										<Button variant="download" onClick={downloadPDF}>
											Report herunterladen
										</Button>
									</div>
								)}
							</>
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
