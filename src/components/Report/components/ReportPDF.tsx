"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import useMobile from "@/lib/utils/useMobile";
import { translateHazardLevels, getToday, translateWMSValue } from "../utils";
import pdfData from "@/components/Report/pdf.json";
import useScenarioMapsLoading from "@/hooks/useScenarioMapsLoading";
import { GeoServerClient } from "@/lib/geoserverClient";
import PDFContent from "./PDFContent";
import { drawPDF } from "../pdf";
import { PDFProps } from "../types";

interface ReportPDFProps {
	skip: string | null;
}

const geoServerClient = new GeoServerClient();

const ReportPDF: FC<ReportPDFProps> = ({ skip }) => {
	const t = useTranslations();
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const makePDFInitializedRef = useRef<boolean>(false);
	const {
		currentUserAddress,
		getHazardEntities,
		locationData,
		floodRiskAnswers,
	} = useStore();
	const hazardEntities = getHazardEntities();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const isMobile = useMobile();
	const [error, setError] = useState<Error | null>(null);
	const openPDFInNewTab = true;

	const allMapsLoaded = useScenarioMapsLoading();

	const pdfKeys: Record<string, string | number | boolean> = {
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
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		// Refactored
		"{basementHazardTag}": "/Red.png",
		"{highBasementHazard}": true,
		"{midBasementHazard}": false,
		"{lowBasementHazard}": false,
		"{dontKnowBasementHazard}": false,
		"{basementUsageTag}": "/Grey.png",
		"{noBasementUsageHazard}": false,
		"{highBasementUsageHazard}": false,
		"{midBasementUsageHazard}": true,
		"{backflowPreventionTag}": "/Green.png",
		"{highBackflowPrevention}": false,
		"{midBackflowPrevention}": false,
		"{lowBackflowPrevention}": false,
		"{dontKnowBackflowPrevention}": true,
		"{propertyDrainageTag}": "/Orange.png",
		"{noPropertyDrainageHazard}": false,
		"{highPropertyDrainageHazard}": false,
		"{lowPropertyDrainageHazard}": true,
		"{pastDamagesTag}": "/Orange.png",
		"{noPastDamages}": false,
		"{highPastDamages}": false,
		"{lowPastDamages}": true,
		"{floodZoneTag}": "/Green.png",
		"{highFloodZone}": false,
		"{lowFloodZone}": true,
		"{fluvialFloodTag}": "/Green.png",
		"{highFluvialFlood}": false,
		"{midFluvialFlood}": false,
		"{lowFluvialFlood}": true,
		"{heavyRainTag}": "/Green.png",
		"{highHeavyRain}": false,
		"{midHeavyRain}": true,
		"{lowHeavyRain}": false,
		"{basementWithWindows}": true,
		"{basementWithoutWindows}": true,
	};

	const makePDF = async () => {
		if (!locationData?.found || !locationData.building) {
			return;
		}
		const buildingWMSData = await geoServerClient.getBuildingWMS(
			locationData?.building,
		);
		// eslint-disable-next-line no-console
		console.log("buildingWMSData :>> ", buildingWMSData);

		const {
			rareHeavyRainMax,
			hasHeavyRainHazardMap,
			uncommonHeavyRainMax,
			extremeHeavyRainMax,
			frequentFloodMax,
			averageFloodMax,
			rareFloodMax,
			rareHeavyRainAverage,
			uncommonHeavyRainAverage,
			extremeHeavyRainAverage,
			errors,
		} = buildingWMSData;

		// Starkregen
		pdfKeys["{showRareHeavyRain}"] = !!rareHeavyRainMax;
		pdfKeys["{rareHeavyRainMax}"] = translateWMSValue(rareHeavyRainMax);
		pdfKeys["{rareHeavyRainAverage}"] = translateWMSValue(
			rareHeavyRainAverage,
			"",
		);
		pdfKeys["{errorRareHeavyRain}"] =
			errors?.includes("rareHeavyRain") || false;
		pdfKeys["{hasSrgkUncommonHeavyRainMap}"] = !!hasHeavyRainHazardMap;
		pdfKeys["{uncommonHeavyRainMax}"] = translateWMSValue(uncommonHeavyRainMax);
		pdfKeys["{uncommonHeavyRainAverage}"] = translateWMSValue(
			uncommonHeavyRainAverage,
			"",
		);
		pdfKeys["{hasSrgkExtremeHeavyRainMap}"] =
			hasHeavyRainHazardMap === "isInExtremeRainHazardMap";
		pdfKeys["{extremeHeavyRainMax}"] = translateWMSValue(extremeHeavyRainMax);
		pdfKeys["{extremeHeavyRainAverage}"] = translateWMSValue(
			extremeHeavyRainAverage,
			"",
		);
		// Flusshochwasser
		pdfKeys["{hasFloodHazardData}"] =
			!!frequentFloodMax && !!averageFloodMax && !!rareFloodMax;
		pdfKeys["{frequentFloodMax}"] = translateWMSValue(frequentFloodMax);
		pdfKeys["{averageFloodMax}"] = translateWMSValue(averageFloodMax);
		pdfKeys["{rareFloodMax}"] = translateWMSValue(rareFloodMax);

		const pdfBlobCreated = await drawPDF(pdfData as PDFProps, pdfKeys);
		if (!pdfBlobCreated?.blob) {
			window.alert("PDF konnte nicht erstellt werden.");
			return;
		}
		setPdfSizeKB(pdfBlobCreated.sizeInMB);
		setPdfBlob(pdfBlobCreated?.blob);
		makePDFInitializedRef.current = false;
	};

	useEffect(() => {
		if (!allMapsLoaded || makePDFInitializedRef.current) {
			return;
		}
		makePDFInitializedRef.current = true;
		makePDF();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
				const url = URL.createObjectURL(pdfBlob);

				if (isMobile || openPDFInNewTab) {
					if (!window) {
						const err = new Error("window is undefined");
						err.name = "WindowUndefined";
						setError(err);
					}
					window.open(url, "_blank");
				} else {
					const a = document.createElement("a");
					a.href = url;
					a.download = "Report-HochwasserCheck-Berlin.pdf";
					a.click();
				}
				setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 4000);
			} else {
				const err = new Error("Button not found");
				err.name = "ButtonNotFoundOnPDF";
				setError(err);
			}
		};

		wrapper.addEventListener("click", handleClick);

		return () => {
			wrapper.removeEventListener("click", handleClick);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pdfBlob]);

	if (error) {
		throw error;
	}

	return (
		<>
			{/* DownloadItem */}
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
					<div className="flex min-h-[150px] items-center justify-end">
						<Spinner
							text="Download PDF wird vorbereitet"
							position="right"
							size="small"
						/>
					</div>
				)}
			</div>
			<PDFContent />
		</>
	);
};

export default ReportPDF;
