"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import PDFContent from "./PDFContent";
import { getToday } from "./pdfUtilsNew";
import { useMapStore } from "@/lib/store/mapStore";
import { useMapLoading } from "@/lib/utils/useMapLoading";
import useMobile from "@/lib/utils/useMobile";
import { createPDF, PDFProps, translateHazardLevels } from "./pdfUtilsNew";
import pdfData from "@/components/DownloadPDF/pdf.json";

interface ReportPDFProps {
	skip: string | null;
}

const ReportPDF: FC<ReportPDFProps> = (/* { skip } */) => {
	const t = useTranslations();
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const currentUserAddress = useStore((state) => state.currentUserAddress);
	const getHazardEntities = useStore((state) => state.getHazardEntities);
	const hazardEntities = getHazardEntities();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const mapSR = useMapStore((s) => s.mapSR);
	const mapHW = useMapStore((s) => s.mapHW);
	const loadingSR = useMapLoading(mapSR, false);
	const loadingHW = useMapLoading(mapHW, false);
	const isMobile = useMobile();
	const [error, setError] = useState<Error | null>(null);
	const openPDFInNewTab = true;

	const makePDF = async () => {
		const pdfKeys = {
			"{date}": getToday(),
			"{address}": currentUserAddress?.label || "Keine Adresse gefunden",
			"{hazardLevelHeavyRain}": hazardEntities
				? translateHazardLevels(hazardEntities[0].hazardLevel)
				: "Keine Daten",
			"{hazardLevelfloodRisk}": hazardEntities
				? translateHazardLevels(hazardEntities[1].hazardLevel)
				: "Keine Daten",
		};
		const pdfBlobCreated = await createPDF(pdfData as PDFProps, pdfKeys);
		if (!pdfBlobCreated?.blob) {
			window.alert("PDF konnte nicht erstellt werden.");
			return;
		}
		setPdfSizeKB(pdfBlobCreated.sizeInMB);
		setPdfBlob(pdfBlobCreated?.blob);
	};

	useEffect(() => {
		if (!mapSR || !mapHW || loadingSR || loadingHW) {
			return;
		}
		makePDF();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapSR, mapHW, loadingSR, loadingHW]);

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
