"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import PDFContent from "./PDFContent";
import { createDownloadPDF, getImageFromHTML, getToday } from "./pdfUtils";
import { useMapStore } from "@/lib/store/mapStore";

interface ReportPDFProps {
	skip: string | null;
}

const ReportPDF: FC<ReportPDFProps> = ({ skip }) => {
	const t = useTranslations();
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const currentUserAddress = useStore((state) => state.currentUserAddress);
	const getHazardEntities = useStore((state) => state.getHazardEntities);
	const hazardEntities = getHazardEntities();
	const floodRiskResult = useStore((state) => state.floodRiskResult);
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const mapSR = useMapStore((s) => s.mapSR);
	const mapHW = useMapStore((s) => s.mapHW);

	const getScreenshotsFromResultsPage = async () => {
		const collectImages = [];
		const IDsToCollect = [
			"heavyRainWidget",
			"fluvialFloodWidget",
			"map-root-sr",
			"map-root-hw",
		];
		if (!skip) {
			IDsToCollect.push("risk-block", "protection-tips");
		}
		for (let index = 0; index < IDsToCollect.length; index++) {
			const id = IDsToCollect[index];
			const findImage = await getImageFromHTML(id);
			if (findImage) {
				collectImages.push(findImage);
			}
		}
		const pdf = await createDownloadPDF(
			t,
			skip,
			floodRiskResult,
			hazardEntities,
			currentUserAddress,
			collectImages,
		);
		setPdfBlob(pdf.blob);
		setPdfSizeKB(pdf.sizeInMB);
	};

	useEffect(() => {
		if (!mapSR || !mapHW) {
			return;
		}
		setTimeout(() => {
			getScreenshotsFromResultsPage();
		}, 5000);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapSR, mapHW]);

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
				const a = document.createElement("a");
				a.href = url;
				a.download = "Report-Hochwassercheck.pdf";
				a.click();
				URL.revokeObjectURL(url);
			}
		};

		wrapper.addEventListener("click", handleClick);

		return () => {
			wrapper.removeEventListener("click", handleClick);
		};
	}, [pdfBlob]);

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
