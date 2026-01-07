"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import PDFContent from "./PDFContent";
import { getToday } from "./pdfUtilsNew";
import useMobile from "@/lib/utils/useMobile";
import { createPDF, PDFProps, translateHazardLevels } from "./pdfUtilsNew";
import pdfData from "@/components/DownloadPDF/pdf.json";
import { ScenarioList } from "@/types/map";
import useScenarioMapsLoading from "@/hooks/useScenarioMapsLoading";

interface ReportPDFProps {
	skip: string | null;
}

const ReportPDF: FC<ReportPDFProps> = (/* { skip } */) => {
	const t = useTranslations();
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const { currentUserAddress, getHazardEntities, locationData } = useStore();
	const hazardEntities = getHazardEntities();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const isMobile = useMobile();
	const [error, setError] = useState<Error | null>(null);
	const openPDFInNewTab = true;

	const allMapsLoaded = useScenarioMapsLoading(ScenarioList);

	const pdfKeys = {
		"{date}": getToday(),
		"{address}": currentUserAddress?.name || "Keine Adresse gefunden",
		"{hazardLevelHeavyRain}": hazardEntities
			? translateHazardLevels(hazardEntities[0].hazardLevel)
			: "Keine Daten",
		"{hazardLevelfloodRisk}": hazardEntities
			? translateHazardLevels(hazardEntities[1].hazardLevel)
			: "Keine Daten",
		"{showNoRareHeavyRain}": !locationData?.isInRareHeavyRainZone,
		"{showRareHeavyRain}": locationData?.isInRareHeavyRainZone,
		"{waterLevelRareHeavyRain}":
			locationData?.isInRareHeavyRainZone || "Keine Daten",
		"{showNoUncommonHeavyRain}": !locationData?.isInUncommonHeavyRainZone,
		"{showUncommonHeavyRain}": locationData?.isInUncommonHeavyRainZone,
		"{waterLevelUncommonHeavyRain}":
			locationData?.isInUncommonHeavyRainZone || "Keine Daten",
	};

	const makePDF = async () => {
		const pdfBlobCreated = await createPDF(pdfData as PDFProps, pdfKeys);
		if (!pdfBlobCreated?.blob) {
			window.alert("PDF konnte nicht erstellt werden.");
			return;
		}
		setPdfSizeKB(pdfBlobCreated.sizeInMB);
		setPdfBlob(pdfBlobCreated?.blob);
	};

	useEffect(() => {
		if (!allMapsLoaded) {
			return;
		}
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
