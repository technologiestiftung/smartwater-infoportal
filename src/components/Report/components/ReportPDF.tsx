/* eslint-disable complexity */
/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { Button, DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import useMobile from "@/lib/utils/useMobile";
import {
	translateHazardLevels,
	getToday,
	translateWMSValue,
	translateHazardTags,
} from "../utils";
import pdfData from "@/components/Report/pdf.json";
import useScenarioMapsLoading from "@/hooks/useScenarioMapsLoading";
import { GeoServerClient } from "@/lib/geoserverClient";
import PDFContent from "./PDFContent";
import { drawPDF } from "../pdf";
import { PDFKeys, PDFProps } from "../types";
import { captureElementToBlob } from "../pdfImageUtils";

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
	} = useStore();
	const hazardEntities = getHazardEntities();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const isMobile = useMobile();
	const openPDFInNewTab = true;
	const isDP =
		typeof window !== "undefined" &&
		window.location.toString().includes("deploy-preview-59");

	const allMapsLoaded = useScenarioMapsLoading();

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

		const imageIds = [
			"heavyRainWidget",
			"fluvialFloodWidget",
			"map-root-sr",
			"map-root-hw",
			"map-root-srgk-rare-heavy-rain",
			"map-root-srgk-uncommon-heavy-rain",
			"map-root-srhk-uncommon-heavy-rain",
			"map-root-srgk-extreme-heavy-rain",
			"map-root-srhk-extreme-heavy-rain",
			"map-root-frequent-flood",
			"map-root-average-frequent-flood",
			"map-root-rare-frequent-flood",
			"map-root-flood-zone",
		];

		if (!skip) {
			imageIds.push("risk-block");
		}

		try {
			for (const elementId of imageIds) {
				const blob = await captureElementToBlob(elementId);
				if (!blob) {
					continue;
				}

				pdfKeys[`#${elementId}`] = blob;

				// await new Promise((r) => requestAnimationFrame(() => r(null)));
			}
		} catch (captureError) {
			setError("Error capturing map images: " + captureError);
			return;
		}

		if (isDP) {
			window.alert("All images captured for PDF");
		}

		// eslint-disable-next-line no-console
		console.log("pdfKeys :>> ", pdfKeys);

		const buildingWMSData = await geoServerClient.getBuildingWMS(
			locationData?.building,
		);

		if (isDP) {
			window.alert("All WMS data fetched for PDF");
		}

		// eslint-disable-next-line no-console
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
			if (isDP) {
				window.alert("PDF created successfully");
			}
			setPdfSizeKB(pdfBlobCreated.sizeInMB);
			setPdfBlob(pdfBlobCreated?.blob);
		} catch (catchError) {
			setError("Error creating PDF: " + catchError);
		}
		makePDFInitializedRef.current = false;
	};

	useEffect(() => {
		if (isDP) {
			window.alert(
				"effect ran" +
					JSON.stringify({
						isMobile: window.innerWidth <= 768,
						width: window.innerWidth,
						already: makePDFInitializedRef.current,
					}),
			);
		}
	}, []);

	/* useEffect(() => {
		const getIsMobile =
			typeof window !== "undefined" && window.innerWidth <= 768;
		if (makePDFInitializedRef.current || !getIsMobile) {
			return;
		}
		makePDFInitializedRef.current = true;
		setTimeout(() => {
			makePDF();
		}, 10000);
	}, []); */

	useEffect(() => {
		const getIsMobile = window.innerWidth <= 768;
		if (makePDFInitializedRef.current || !getIsMobile) {
			return;
		}

		makePDFInitializedRef.current = true;

		const to = window.setTimeout(() => {
			makePDF();
		}, 10_000);

		return () => window.clearTimeout(to);
	}, [makePDF]);

	useEffect(() => {
		const getIsMobile =
			typeof window !== "undefined" && window.innerWidth <= 768;
		if (!allMapsLoaded || makePDFInitializedRef.current || getIsMobile) {
			return;
		}
		makePDFInitializedRef.current = true;
		makePDF();
	}, [allMapsLoaded]);

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
								<div className="flex min-h-[150px] items-center justify-end">
									<div className="flex flex-col gap-2">
										<Spinner
											text="HochwasserCheck Report wird erstellt..."
											position="right"
											size="small"
										/>
										<p className="ml-10 italic">
											*Dies kann einen Moment dauern
										</p>
									</div>
								</div>
								<div className="divider" />
							</>
						)}
					</div>
				</>
			)}
			<PDFContent />
		</>
	);
};

export default ReportPDF;
