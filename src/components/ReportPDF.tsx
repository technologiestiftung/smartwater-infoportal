"use client";

import jsPDF from "jspdf";
import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import Image from "next/image";
import { DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import ResultBlock from "./ResultBlock";
import { transform } from "ol/proj";
import { useMapStore } from "@/lib/store/mapStore";

interface ReportPDFProps {
	skip: string | null;
}

const ReportPDF: FC<ReportPDFProps> = ({ skip }) => {
	const t = useTranslations();
	const [resultsImages, setResultImages] = useState<string[]>([]);
	const [mapImages, setMapImages] = useState<
		{ title: "heavyRain" | "fluvialFlood" | null; src: string }[]
	>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const testing = process.env.NODE_ENV === "development";
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const currentUserAddress = useStore((state) => state.currentUserAddress);
	const aboutBlank = true;
	const getHazardEntities = useStore((state) => state.getHazardEntities);
	const hazardEntities = getHazardEntities();
	const floodRiskResult = useStore((state) => state.floodRiskResult);
	const heavyRain = hazardEntities?.filter(
		(entity) => entity.name === "heavyRain",
	);
	const fluvialFlood = hazardEntities?.filter(
		(entity) => entity.name === "fluvialFlood",
	);
	const createReport = useStore((state) => state.createReport);
	const updateCreateReport = useStore((state) => state.updateCreateReport);
	const map = useMapStore((s) => s.map);
	const config = useMapStore((state) => state.config);

	const formatDate = (date: Date): string => {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	};
	const today = new Date();

	const translateLevels = (level: string): string => {
		if (level === "low") {
			return "Gering";
		}
		if (level === "moderate") {
			return "Mittel";
		}
		if (level === "high") {
			return "Hoch";
		}
		if (level === "severe") {
			return "Sehr Hoch";
		}
		return level;
	};

	const RenderHeader = () => (
		<>
			<Image
				src="/Logo-SMUVK.png"
				alt="Logo Senatsverwaltung"
				width={170}
				height={0}
			/>
			<div>
				<h1 className="mb-2 font-bold">
					{t("floodCheck.reportDownload.pdf.title")}
				</h1>
				<h2>{t("floodCheck.reportDownload.pdf.subTitle")}</h2>
			</div>
		</>
	);
	const RenderFooter = ({ num }: { num: number }) => (
		<div className="mt-auto flex justify-between">
			<p className="text-xs">
				Herausgeber: Senatsverwaltung für Mobilität, Verkehr, Klimaschutz und
				Umwelt Berlin
			</p>
			<p className="text-xs">Seite {num} von 2</p>
		</div>
	);

	const getImageFromHTML = async (elementId: string) => {
		const findImage = document.getElementById(elementId);
		if (findImage) {
			const chartCanvas = await html2canvas(findImage, { scale: 1 });
			const chartImg = chartCanvas.toDataURL("image/png");
			return chartImg;
		}
		return null;
	};

	const getResultsImages = async () => {
		const collectImages = [];
		const findStarkregenWidget = await getImageFromHTML("heavyRainWidget");
		if (findStarkregenWidget) {
			collectImages.push(findStarkregenWidget);
		}
		const findHochwasserWidget = await getImageFromHTML("fluvialFloodWidget");
		if (findHochwasserWidget) {
			collectImages.push(findHochwasserWidget);
		}
		if (!skip) {
			const findRiskBlock = await getImageFromHTML("risk-block");
			if (findRiskBlock) {
				collectImages.push(findRiskBlock);
			}
			const findProtectionTips = await getImageFromHTML("protection-tips");
			if (findProtectionTips) {
				collectImages.push(findProtectionTips);
			}
		}
		setResultImages(collectImages);
	};

	const createPDF = async () => {
		// eslint-disable-next-line new-cap
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
		});

		const content = document.getElementById("pdf-content");
		const fileName = "Report-HochwasserCheck.pdf";

		if (!content) {
			throw new Error("Content not found");
		}
		await doc.html(content, {
			callback: (createdDoc) => {
				const totalPages = createdDoc.getNumberOfPages();
				createdDoc.deletePage(totalPages);

				if (aboutBlank) {
					const blobUrl = createdDoc.output("bloburl");
					const link = document.createElement("a");
					link.href = blobUrl.toString();
					link.target = "_blank";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				} else {
					createdDoc.save(fileName);
				}
				setLoading(false);
			},
			x: 0,
			y: 0,
			width: 210,
			windowWidth: 793,
		});
	};

	const triggerMapImages = () => {
		if (!map || !config) {
			return;
		}
		setLoading(true);
		const { lon, lat } = currentUserAddress || {};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const isValidCoord = (val: any) =>
			!isNaN(Number(val)) && typeof val === "string" && val.trim() !== "";

		if (!isValidCoord(lon) || !isValidCoord(lat)) {
			console.warn("[zoomToUserAddress] Invalid coordinates");
			return;
		}

		const lonLat: [number, number] = [Number(lon), Number(lat)];

		const mapViewConfig = config.portalConfig.map.mapView;
		const projection = mapViewConfig.epsg;

		const transformed = transform(lonLat, "EPSG:4326", projection);

		map.getView().animate({
			center: transformed,
			zoom: 6,
			duration: 0,
		});

		updateCreateReport("heavyRain");

		setTimeout(() => {
			updateCreateReport("fluvialFlood");
			setTimeout(() => {
				updateCreateReport(null);
			}, 5000);
		}, 5000);
	};

	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper || !map || !config) {
			return;
		}

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const clickedButton = target.closest("button");
			if (clickedButton && wrapper.contains(clickedButton) && !loading) {
				triggerMapImages();
			}
		};

		wrapper.addEventListener("click", handleClick);
		// eslint-disable-next-line consistent-return
		return () => wrapper.removeEventListener("click", handleClick);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, config]);

	useEffect(() => {
		const getMapImage = async () => {
			const getImage = await getImageFromHTML("map-root");
			if (!getImage) {
				console.warn("No Map Root image was found");
				return;
			}
			if (mapImages.length === 0 || mapImages.length === 2) {
				setMapImages([
					{
						title: createReport,
						src: getImage,
					},
				]);
			} else {
				setMapImages([
					...mapImages,
					{
						title: createReport,
						src: getImage,
					},
				]);
			}
		};
		if (createReport !== null) {
			setTimeout(() => {
				getMapImage();
			}, 2000);
		} else if (mapImages.length > 0) {
			createPDF();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createReport]);

	useEffect(() => {
		setTimeout(() => {
			if (!resultsImages.length) {
				getResultsImages();
			}
		}, 2000);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const RenderImage = ({
		imageSrc,
		setHeight,
	}: {
		imageSrc: string | null | undefined;
		setHeight?: string;
	}) => {
		if (!imageSrc) {
			return null;
		}
		return (
			<>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={imageSrc}
					alt="Result Image"
					className={`h-full w-auto object-contain ${setHeight || "max-h-[230px]"}`}
				/>
			</>
		);
	};

	return (
		<>
			<div ref={wrapperRef}>
				<DownloadItem
					buttonText={t("floodCheck.reportDownload.button")}
					date="03/1974"
					description={t("floodCheck.reportDownload.description")}
					downloadUrl="#results"
					fileType="PLACEHOLDER: Doctype: PDF-Dokument (39,6 kB) – Stand: 02/2025"
					title={t("floodCheck.reportDownload.title")}
				/>
			</div>
			<div
				className={`flex w-full justify-end py-4 ${loading ? "visible" : "invisible"}`}
			>
				<Spinner size="small" position="right" text="PDF wird erstellt..." />
			</div>
			<div className={testing ? "" : "absolute -left-[9999px]"}>
				<div id="heavyRainWidget" className="w-fit">
					{(() => {
						if (heavyRain) {
							return (
								<div className="w-[400px]">
									{heavyRain.map((entity) => (
										<ResultBlock
											key={entity.name}
											entity={entity.name}
											hazardLevel={entity.hazardLevel}
											showSubLabel={entity.showSubLabel || false}
											subHazardLevel={entity.subHazardLevel}
										/>
									))}
								</div>
							);
						}
						return <p className="">{t("floodCheck.noHazardData")}</p>;
					})()}
				</div>
				<div id="fluvialFloodWidget" className="w-fit">
					{(() => {
						if (fluvialFlood) {
							return (
								<div className="w-[400px]">
									{fluvialFlood.map((entity) => (
										<ResultBlock
											key={entity.name}
											entity={entity.name}
											hazardLevel={entity.hazardLevel}
											showSubLabel={entity.showSubLabel || false}
											subHazardLevel={entity.subHazardLevel}
										/>
									))}
								</div>
							);
						}
						return <p className="">{t("floodCheck.noHazardData")}</p>;
					})()}
				</div>
				<div id="pdf-content">
					<div className="flex min-w-full flex-col gap-2 bg-white p-[15mm] [height:297mm] [width:210mm]">
						<RenderHeader />
						<p className="text-right">
							{t("floodCheck.reportDownload.pdf.date", {
								date: formatDate(today),
							})}
						</p>
						<div>
							<p className="mb-2 text-lg">
								{t("floodCheck.reportDownload.pdf.locationTitle")}
							</p>
							{currentUserAddress && (
								<div className="flex items-center gap-2">
									<Image
										src="/LocationDot.png"
										alt="Location Dot"
										width={18}
										height={18}
									/>
									<p className="mt-[3px]">{currentUserAddress.display_name}</p>
								</div>
							)}
						</div>
						<div>
							{hazardEntities?.map((entity, index) => (
								<div key={index} className="mb-2">
									<p className="mb-2 text-lg">
										Gefährdung durch{" "}
										{entity.name === "heavyRain"
											? "Starkregen"
											: "Flusshochwasser"}{" "}
										an Ihrem Standort:{" "}
										<span className="font-bold">
											{translateLevels(entity.hazardLevel)}
										</span>
									</p>
									<div className="flex w-full gap-6">
										{resultsImages.length > 0 && (
											<RenderImage imageSrc={resultsImages[index]} />
										)}
										{mapImages.length > 0 && (
											<RenderImage imageSrc={mapImages[index]?.src} />
										)}
									</div>
								</div>
							))}
						</div>
						<div>
							<p className="text-xs font-bold">
								Für die Berechnung der Gefährdungskarten nutzen wir Karten des
								Geoportals Berlin, veröffentlicht durch die SenMVKU.
							</p>
							<p className="text-xs">
								Bitte beachten Sie, dass die Ergebnisse der Karte sowie die
								Einschätzung der Hochwassergefährdung eine gewisse Unsicherheit
								bergen. Die Datengrundlage entbindet nicht von der Pflicht für
								einzelne Projekte, die hydraulischen Standortvoraussetzungen vor
								Ort zu erkunden und nachzuweisen. Ein Abgleich des Modells ist
								mit der Situation vor Ort erforderlich.
							</p>
						</div>
						<RenderFooter num={1} />
					</div>
					{!skip && (
						<>
							<div className="[page-break-before:always]" />
							<div className="flex min-w-full flex-col gap-2 bg-white p-[15mm] [height:297mm] [width:210mm]">
								<RenderHeader />
								<div className="mt-6">
									{floodRiskResult && (
										<p className="mb-2 text-lg">
											Risiko an Ihrem Standort{" "}
											<span className="font-bold">
												{translateLevels(floodRiskResult?.riskLevel)}
											</span>
										</p>
									)}
									<div className="align-center flex gap-6">
										{resultsImages.length > 2 && (
											<RenderImage
												imageSrc={resultsImages[2]}
												setHeight="max-h-[300px]"
											/>
										)}
										<div className="bg-grey p-6">
											<p className="mb-2 font-bold">Hinweis & Disclaimer</p>
											<p className="text-xs">
												Auf Basis Ihrer Antworten haben wir das individuelle
												Gebäuderisiko errechnet. Das konkrete Risiko Ihres
												Gebäudes ist von einer Vielzahl baulicher Eigenschaften
												abhängig, die sich durch den Fragebogen nicht in vollem
												Umfang bewerten lassen. Bitte beachten Sie, dass die
												Einstufung des Risikos für Ihr Gebäude auf Basis Ihrer
												Angaben eine gewisse Unsicherheit birgt und die
												Auswertung hier lediglich einer Anregung zur
												Eigenvorsorge dient.
												<br />
												<br />
												Die Berechnung basiert auf bestehenden Angeboten des
												LAWA-Starkregenportals, des Hochwasser Kompetenz
												Centrums HKC („Quick-Check“) und des Gesamtverbands der
												Deutschen Versicherungswirtschaft (GDV).
											</p>
										</div>
									</div>
								</div>
								<RenderFooter num={2} />
							</div>
							<div className="[page-break-before:always]" />
							<div className="flex min-w-full flex-col gap-2 bg-white p-[15mm] [height:297mm] [width:210mm]">
								<RenderHeader />
								<div className="mt-6">
									<p className="mb-2 text-lg font-bold">
										Handlungsempfehlungen
									</p>
									{resultsImages.length > 2 && (
										<RenderImage
											imageSrc={resultsImages[3]}
											setHeight="max-h-[400px]"
										/>
									)}
								</div>
								<RenderFooter num={3} />
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default ReportPDF;
