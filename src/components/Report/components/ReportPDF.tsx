/* eslint-disable */
"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { Button, DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import useMobile from "@/lib/utils/useMobile";
import { ScenarioList, Scenario } from "@/types/map";
import {
	translateHazardLevels,
	getToday,
	translateWMSValue,
	translateHazardTags,
} from "../utils";
import pdfData from "@/components/Report/pdf.json";
import { GeoServerClient } from "@/lib/geoserverClient";
import { drawPDF } from "../pdf";
import { PDFKeys, PDFProps } from "../types";
import { getScenarioDomId } from "@/lib/utils/mapUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface ReportPDFProps {
	skip: string | null;
}

const geoServerClient = new GeoServerClient();

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
	const isMobile = useMobile();
	const openPDFInNewTab = true;

	const checks = [
		{
			id: "wms",
			text: "Alle Daten errechnet",
		},
		{
			id: "images",
		},
		{
			id: "pdf",
			text: "PDF erstellt",
		},
	];

	const pdfKeys: PDFKeys = {
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
		if (!locationData?.found || !locationData.building) {
			return setError(
				"Es wurden leider keine Gebäudedaten gefunden. Also kann das PDF nicht erstellt werden.",
			);
		}

		if (error) {
			setError(null);
		}

		if (done.length > 0) {
			setDone([]);
		}

		const buildingWMSData = await geoServerClient.getBuildingWMS(
			locationData?.building,
		);

		setDone((prev) => [...prev, "wms"]);

		console.log("buildingWMSData :>> ", buildingWMSData);

		const imageIds = ["heavyRainWidget", "fluvialFloodWidget"];

		if (!skip) {
			imageIds.push("risk-block");
		}

		try {
			for (const scenario of ["scenario", ...imageIds]) {
				let path = "";
				const key: string =
					scenario.includes("Widget") || scenario === "risk-block"
						? scenario
						: getScenarioDomId(scenario as Scenario);

				const body: {
					url: string;
					buildingGeometry?: any;
					outlineBufferGeometry?: any;
					floodRiskResultDown?: any;
					floodRiskAnswersDown?: any;
					hazardEntitiesDown?: any;
				} = { url: "" };

				if (scenario === "risk-block") {
					path = `/riskblock-screenshot`;
					body.floodRiskResultDown = floodRiskResult;
					body.floodRiskAnswersDown = floodRiskAnswers;
					body.hazardEntitiesDown = hazardEntities;
				} else if (scenario === "heavyRainWidget") {
					const heavyRain = hazardEntities?.filter(
						(entity) => entity.name === "heavyRain",
					)[0];
					if (heavyRain) {
						path = `/widget-screenshot?name=${heavyRain.name}&hazardLevel=${heavyRain.hazardLevel}`;
					}
				} else if (scenario === "fluvialFloodWidget") {
					const fluvialFlood = hazardEntities?.filter(
						(entity) => entity.name === "fluvialFlood",
					)[0];
					if (fluvialFlood) {
						path = `/widget-screenshot?name=${fluvialFlood.name}&hazardLevel=${fluvialFlood.hazardLevel}&showSubLabel=${fluvialFlood.showSubLabel}&subHazardLevel=${fluvialFlood.subHazardLevel}`;
					}
				} else {
					body.buildingGeometry = locationData?.building?.geometry;
					body.outlineBufferGeometry =
						locationData?.building?.outlineBufferGeometry;
					path = `/scenario-map?scenario=${scenario}`;
				}
				body.url = `${window.location.origin}${path}`;
				const res = await fetch("/api/screenshot", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});

				const text = await res.text();

				if (!res.ok) {
					throw new Error(`Screenshot API failed (${res.status}): ${text}`);
				}

				const data = JSON.parse(text);

				if (!!data.images) {
					for (
						let imageIndex = 0;
						imageIndex < data.images.length;
						imageIndex++
					) {
						const scenarioScreenshot = data.images[imageIndex];
						const blob = await fetch(scenarioScreenshot.dataUrl).then((r) =>
							r.blob(),
						);
						const scenarioKey = getScenarioDomId(
							scenarioScreenshot.scenario as Scenario,
						);
						pdfKeys[`#${scenarioKey}`] = blob;
						setDone((prev) => [...prev, "images"]);
					}
				} else {
					const { imageBase64 } = data;
					const dataUrl = `data:image/jpeg;base64,${imageBase64}`;
					const blob = await fetch(dataUrl).then((r) => r.blob());
					pdfKeys[`#${key}`] = blob;
					setDone((prev) => [...prev, "images"]);
				}
			}
		} catch (captureError) {
			setError("Error capturing map images: " + captureError);
			return;
		}

		console.log("pdfKeys :>> ", pdfKeys);

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

		// Rare Heavy Rain
		const errorRareHeavyRain = errors?.includes("rareHeavyRain") || false;
		pdfKeys["{showRareHeavyRain}"] = !!rareHeavyRainMax;
		pdfKeys["{rareHeavyRainMax}"] = translateWMSValue(rareHeavyRainMax);
		pdfKeys["{rareHeavyRainAverage}"] = translateWMSValue(
			rareHeavyRainAverage,
			"",
		);
		pdfKeys["{errorRareHeavyRain}"] = errorRareHeavyRain;

		// Uncommon Heavy Rain
		const errorUncommonHeavyRain =
			errors?.includes("uncommonHeavyRain") || false;
		pdfKeys["{hasSrgkUncommonHeavyRainMap}"] =
			!errorUncommonHeavyRain && !!hasHeavyRainHazardMap;
		pdfKeys["{hasSrhkUncommonHeavyRainMap}"] =
			!errorUncommonHeavyRain && !hasHeavyRainHazardMap;
		pdfKeys["{uncommonHeavyRainMax}"] = translateWMSValue(uncommonHeavyRainMax);
		pdfKeys["{uncommonHeavyRainAverage}"] = translateWMSValue(
			uncommonHeavyRainAverage,
			"",
		);
		pdfKeys["{errorUncommonHeavyRain}"] =
			errors?.includes("uncommonHeavyRain") || false;

		// Extreme Heavy Rain
		const errorExtremeHeavyRain = errors?.includes("extremeHeavyRain") || false;
		pdfKeys["{hasSrgkExtremeHeavyRainMap}"] =
			!errorExtremeHeavyRain &&
			hasHeavyRainHazardMap === "isInExtremeRainHazardMap";
		pdfKeys["{hasSrhkExtremeHeavyRainMap}"] =
			!errorExtremeHeavyRain &&
			hasHeavyRainHazardMap !== "isInExtremeRainHazardMap";
		pdfKeys["{extremeHeavyRainMax}"] = translateWMSValue(extremeHeavyRainMax);
		pdfKeys["{extremeHeavyRainAverage}"] = translateWMSValue(
			extremeHeavyRainAverage,
			"",
		);
		pdfKeys["{errorExtremeHeavyRain}"] = errorExtremeHeavyRain;

		// Frequent Flood
		const errorFrequentFlood = errors?.includes("frequentFlood") || false;
		pdfKeys["{errorFrequentFlood}"] = errorFrequentFlood;
		pdfKeys["{hasNoFrequentFloodData}"] =
			!errorFrequentFlood && !frequentFloodMax;
		pdfKeys["{hasFrequentFloodData}"] =
			!errorFrequentFlood && !!frequentFloodMax;
		pdfKeys["{frequentFloodMax}"] = translateWMSValue(frequentFloodMax);
		pdfKeys["{frequentFloodAverage}"] = translateWMSValue(frequentFloodAverage);

		// Average Flood
		const errorAverageFlood = errors?.includes("averageFlood") || false;
		pdfKeys["{errorAverageFlood}"] = errorAverageFlood;
		pdfKeys["{hasNoAverageFloodData}"] = !errorAverageFlood && !averageFloodMax;
		pdfKeys["{hasAverageFloodData}"] = !errorAverageFlood && !!averageFloodMax;
		pdfKeys["{averageFloodMax}"] = translateWMSValue(averageFloodMax);
		pdfKeys["{averageFloodAverage}"] = translateWMSValue(averageFloodAverage);

		// Rare Flood
		const errorRareFlood = errors?.includes("rareFlood") || false;
		pdfKeys["{errorRareFlood}"] = errorRareFlood;
		pdfKeys["{hasNoRareFloodData}"] = !errorRareFlood && !rareFloodMax;
		pdfKeys["{hasRareFloodData}"] = !errorRareFlood && !!rareFloodMax;
		pdfKeys["{rareFloodMax}"] = translateWMSValue(rareFloodMax);
		pdfKeys["{rareFloodAverage}"] = translateWMSValue(rareFloodAverage);

		// Flood Zone
		const errorFloodZone = errors?.includes("floodZoneIndex") || false;
		pdfKeys["{errorFloodZone}"] = errorFloodZone;
		pdfKeys["{hasNoFloodZoneData}"] =
			!errorFloodZone && !locationData.building.floodZoneIndex;
		pdfKeys["{hasFloodZoneData}"] =
			!errorFloodZone && !!locationData.building.floodZoneIndex;

		// Draw PDF
		try {
			const pdfBlobCreated = await drawPDF(pdfData as PDFProps, pdfKeys);
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
						Beim Erstellen des PDFs ist ein Fehler aufgetreten: <br />
						<b>{error}</b>
					</p>
					<Button onClick={() => makePDF()}>Erneut probieren</Button>
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
												const getImagesCount = done.filter(
													(c) => c === "images",
												).length;
												const isDone =
													check.id === "images"
														? !skip
															? getImagesCount === 14
															: getImagesCount === 13
														: done.includes(check.id);
												const checkText =
													check.id === "images"
														? `${done.filter((c) => c === "images").length} von ${!skip ? 14 : 13} Bildern erstellt`
														: check.text;
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
															{checkText}
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
