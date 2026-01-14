/* eslint-disable complexity */
"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import PDFContent from "./PDFContent";
import useMobile from "@/lib/utils/useMobile";
import {
	createPDF,
	PDFProps,
	translateHazardLevels,
	getToday,
} from "./pdfUtils";
import pdfData from "@/components/DownloadPDF/pdf.json";
import useScenarioMapsLoading from "@/hooks/useScenarioMapsLoading";
import { GeoServerClient } from "@/lib/geoserverClient";

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
		"{didSkip}": !!skip,
		"{didNotSkip}": !skip,
		"{isOwner}":
			!!skip ||
			(typeof floodRiskAnswers?.q0?.value === "string" &&
				floodRiskAnswers?.q0?.value?.includes("Owner")),
		"{isNotOwner}":
			!!skip ||
			(typeof floodRiskAnswers?.q0?.value === "string" &&
				!floodRiskAnswers?.q0?.value?.includes("Owner")),
	};

	const makePDF = async () => {
		// console.log("allMapLoaded locationData :>> ", locationData);
		if (!locationData?.found || !locationData.building) {
			return;
		}
		// console.log("makePDF");
		const buildingWMSData = await geoServerClient.getWMS(
			locationData?.building,
		);
		// console.log("buildingWMSData :>> ", buildingWMSData);
		pdfKeys["{showRareHeavyRain}"] = !!buildingWMSData?.rareHeavyRain;
		pdfKeys["{rareHeavyRain}"] =
			buildingWMSData?.rareHeavyRain || "Keine Daten";
		pdfKeys["{showUncommonHeavyRain}"] = !!buildingWMSData?.uncommonHeavyRain;
		pdfKeys["{uncommonHeavyRain}"] =
			buildingWMSData?.uncommonHeavyRain || "Keine Daten";
		pdfKeys["{showExtremeHeavyRain}"] = !!buildingWMSData?.extremeHeavyRain;
		pdfKeys["{extremeHeavyRain}"] =
			buildingWMSData?.extremeHeavyRain || "Keine Daten";
		pdfKeys["{hasSrgkExtremeHeavyRainMap}"] =
			buildingWMSData.hasHeavyRainHazardMap === "isInExtremeRainHazardMap";
		pdfKeys["{hasSrgkHeavyRainMap}"] = !!buildingWMSData.hasHeavyRainHazardMap;

		const pdfBlobCreated = await createPDF(pdfData as PDFProps, pdfKeys);
		if (!pdfBlobCreated?.blob) {
			window.alert("PDF konnte nicht erstellt werden.");
			return;
		}
		setPdfSizeKB(pdfBlobCreated.sizeInMB);
		setPdfBlob(pdfBlobCreated?.blob);
		makePDFInitializedRef.current = false;
	};

	useEffect(() => {
		// console.log("allMapsLoaded :>> ", allMapsLoaded);
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
			{/* PDFContent */}
			<PDFContent />
		</>
	);
};

export default ReportPDF;
