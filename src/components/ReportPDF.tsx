"use client";

import { Button } from "berlin-ui-library";
import jsPDF from "jspdf";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";

export default function ReportPDF() {
	const t = useTranslations();
	const [resultsImages, setResultImages] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const aboutBlank = true;

	const getResultsImages = async () => {
		setLoading(true);
		const collectImages = [];
		// retrieve RiskBlock from DOM
		const findRiskBlock = document.getElementById("risk-block");
		if (findRiskBlock) {
			const chartCanvas = await html2canvas(findRiskBlock, { scale: 1 });
			const chartImg = chartCanvas.toDataURL("image/png");
			collectImages.push(chartImg);
		}
		// retrieve StarkRegen Widget from DOM
		const findStarkregenWidget = document.getElementById("starkregen-widget");
		if (findStarkregenWidget) {
			const chartCanvas = await html2canvas(findStarkregenWidget, { scale: 2 });
			const chartImg = chartCanvas.toDataURL("image/png");
			collectImages.push(chartImg);
		}

		// retrieve SmartWater Map
		// TBD...

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

	useEffect(() => {
		if (resultsImages.length) {
			createPDF();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resultsImages]);

	const RenderImage = ({
		imageSrc,
	}: {
		imageSrc: string | null | undefined;
	}) => {
		if (!imageSrc) {
			return null;
		}
		return (
			<Image
				src={imageSrc}
				alt="Result Image"
				width={400}
				height={0}
				className="h-auto max-w-[90mm]"
			/>
		);
	};

	return (
		<>
			<h3 className="text-pink-600">TESTING: Report PDF Download</h3>
			<h3 className={`mt-0 text-pink-600 ${loading ? "" : "invisible"}`}>
				Lädt...
			</h3>
			<Button
				variant="download"
				className="mb-10 w-full self-start lg:w-fit"
				onClick={getResultsImages}
			>
				TESTING: Report PDF Download
			</Button>
			<div className="absolute -left-[9999px]">
				<div id="pdf-content">
					<div className="flex flex-col gap-6 bg-white p-[20mm] [height:297mm] [width:210mm]">
						<h1>Gesamtergebnis HochwasserCheck</h1>
						<div className="flex w-full flex-col">
							<h2>{t("floodCheck.hazardAtLocation")}</h2>
							<p>Placeholder Adresse</p>
							<p>Placeholder PLZ - Stadt</p>
						</div>
						<RenderImage imageSrc={resultsImages[0]} />
						<RenderImage imageSrc={resultsImages[1]} />
					</div>
					<div className="[page-break-before:always]" />
					<div className="flex flex-col gap-12 bg-white p-[20mm] [height:297mm] [width:210mm]">
						<h1>Handlungsempfehlungen</h1>
						<p>
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit
							magni vero, saepe officia reprehenderit explicabo quod nesciunt,
							deleniti sit quos vel assumenda blanditiis! Delectus impedit in
							culpa officia id dolorem?
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
