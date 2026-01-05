/* eslint-disable */

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import ArialBold from "./assets/arial-bold";
import ArialNormal from "./assets/arial-normal";
import LogoSMVKU from "./assets/Logo-SMVKU.png";
import LocationDot from "./assets/LocationDot.png";

export const translateHazardLevels = (level: string): string => {
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
export const getToday = (): string => {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");
	const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const year = today.getFullYear();
	return `${day}.${month}.${year}`;
};

export async function getAspectRatio(
	imageSrc: string,
): Promise<{ aspectRatio: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = function () {
			const originalWidth = img.naturalWidth;
			const originalHeight = img.naturalHeight;
			const aspectRatio = originalWidth / originalHeight;

			resolve({ aspectRatio });
		};
		img.onerror = function () {
			reject(new Error(`Failed to load image. URL: ${imageSrc}`));
		};
		img.src = imageSrc;
	});
}

async function downscaleImage(src: string, maxWidth = 500): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const scale = maxWidth / img.width;
			const canvas = document.createElement("canvas");
			canvas.width = maxWidth;
			canvas.height = img.height * scale;

			const ctx = canvas.getContext("2d");
			if (!ctx) return reject("Canvas context error");

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL("image/jpeg", 0.7)); // compression quality
		};
		img.onerror = reject;
		img.crossOrigin = "anonymous";
		img.src = src;
	});
}

function getBase64ImageSize(dataUrl: string): {
	bytes: number;
	kilobytes: number;
	megabytes: number;
} {
	if (!dataUrl.startsWith("data:image")) {
		throw new Error("Invalid data URL");
	}

	const base64String = dataUrl.split(",")[1];
	const byteLength =
		(base64String.length * 3) / 4 -
		(base64String.endsWith("==") ? 2 : base64String.endsWith("=") ? 1 : 0);

	return {
		bytes: byteLength,
		kilobytes: byteLength / 1024,
		megabytes: byteLength / (1024 * 1024),
	};
}

export const getImageFromHTML = async (elementId: string) => {
	const findImage = document.getElementById(elementId);
	if (findImage) {
		const html2canvasImage = await html2canvas(findImage, { scale: 1 });
		const makeImage = html2canvasImage.toDataURL("image/jpeg");
		const downscaledImage = await downscaleImage(makeImage);
		const getSizeMakeImage = getBase64ImageSize(makeImage);
		const getSizeDownscaledImage = getBase64ImageSize(downscaledImage);
		return {
			id: elementId,
			makeImage,
			downscaledImage,
			getSizeMakeImage,
			getSizeDownscaledImage,
		};
	}
	return null;
};

// Utils to create PDF
const mm = (px: number): number => {
	const pixelsToMM = 0.3529411765;
	return px * pixelsToMM;
};

interface PDFPageItem {
	text?: string;
	imageSRC?: string;
	fontSize?: "small" | "normal" | "h1" | "h2" | number;
	fontWeight?: "normal" | "bold";
	textAlign?: "left" | "center" | "right";
	noLineBreakAfterText?: boolean;
	marginBottom?: number;
	maxWidthOfText?: "halfPage" | "fullPage";
}

interface PDFPages {
	items: PDFPageItem[];
}

interface PDFProps {
	name: string;
	showPageNumbers?: boolean;
	pagesPaddingY: number;
	pagesPaddingX: number;
	captureImagesFromHTML?: string[];
	pages: PDFPages[];
}

export const createPDF = async (pdf: PDFProps, pdfKeys: any) => {
	if (!pdf || !pdf.pages || pdf.pages.length === 0) {
		console.error("No PDF data provided");
		return null;
	}
	const doc = new jsPDF({
		unit: "mm",
		format: "a4",
	});

	// PDF utils
	const {
		pagesPaddingY: paddingY,
		pagesPaddingX: paddingX,
		pages,
		showPageNumbers,
	} = pdf;
	const pagesPaddingY = mm(paddingY || 40);
	const pagesPaddingX = mm(paddingX || 30);

	const pageInnerWidth = mm(515 - 2 * (paddingX || 30));
	const pageInnerHeight = mm(782 - 2 * (paddingY || 40));
	const gap = 20;
	const leftHalfOfThePage = pageInnerWidth / 2 - mm(gap);

	const writeTextOnPDF = (props: any) => {
		if (!props) {
			return;
		}

		const {
			text,
			fontSize,
			fontWeight,
			textAlign,
			y,
			noLineBreakAfterText,
			marginBottom,
			maxWidth,
		} = props;

		if (!text) {
			return;
		}

		let setSize = typeof fontSize === "number" ? fontSize : 12;
		if (fontSize === "small") {
			setSize = 9;
		} else if (fontSize === "h1") {
			setSize = 25;
		} else if (fontSize === "h2") {
			setSize = 18;
		}
		const setLineHeight = mm(setSize * 1.1);
		const setMaxWidth = maxWidth ? leftHalfOfThePage : pageInnerWidth;

		doc.setFontSize(setSize);

		if (fontWeight === "b") {
			doc.setFont("Arial", "bold");
		} else {
			doc.setFont("Arial", "normal");
		}
		const lines = doc.splitTextToSize(text, setMaxWidth);

		const posY = y ?? vertical;

		if (lines.length === 1) {
			const posX =
				textAlign === "right"
					? pageInnerWidth + pagesPaddingX - doc.getTextWidth(text)
					: textAlign === "center"
						? pagesPaddingX + (pageInnerWidth - doc.getTextWidth(text)) / 2
						: pagesPaddingX;
			doc.text(lines[0], posX, posY, {
				maxWidth: setMaxWidth,
				lineHeightFactor: 1.5,
			});
		} else {
			lines.forEach((line: string, index: number) => {
				const posX =
					textAlign === "right"
						? pageInnerWidth + pagesPaddingX - doc.getTextWidth(line)
						: textAlign === "center"
							? pagesPaddingX + (pageInnerWidth - doc.getTextWidth(line)) / 2
							: pagesPaddingX;
				doc.text(line, posX, posY + index * setLineHeight, {
					maxWidth: setMaxWidth,
				});
			});
		}

		if (!noLineBreakAfterText) {
			vertical += lines.length * setLineHeight;
		}

		if (typeof marginBottom === "number") {
			vertical += mm(marginBottom);
		}
	};

	// Add Arial Font
	doc.addFileToVFS("Arial.ttf", ArialNormal);
	doc.addFont("Arial.ttf", "Arial", "normal");
	doc.addFileToVFS("Arial-Bold.ttf", ArialBold);
	doc.addFont("Arial-Bold.ttf", "Arial", "bold");

	// Changing Values
	let vertical = pagesPaddingY;

	for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
		const page = pages[pageIndex];

		if (showPageNumbers) {
			const pageNumber = `Seite ${pageIndex + 1} von ${pages.length}`;
			writeTextOnPDF({
				text: pageNumber,
				fontSize: "small",
				textAlign: "right",
				y: pageInnerHeight + pagesPaddingY,
				noLineBreakAfterText: true,
			});
		}

		if (page.items && page.items.length > 0) {
			for (let itemIndex = 0; itemIndex < page.items.length; itemIndex++) {
				const item = page.items[itemIndex];
				if (item.text) {
					let text = item.text;
					if (pdfKeys) {
						Object.keys(pdfKeys).forEach((key) => {
							const value = pdfKeys[key];
							text = text.replace(key, value);
						});
					}
					writeTextOnPDF({
						text,
						fontSize: item.fontSize,
						fontWeight: item.fontWeight,
						textAlign: item.textAlign,
						noLineBreakAfterText: item.noLineBreakAfterText,
						marginBottom: item.marginBottom,
						maxWidthOfText: item.maxWidthOfText,
					});
				} else if (item.imageSRC) {
					// startsWith("#")
					// get image from fetched
					//
					// startsWith("http")
					// get image from URL
					//
					// startsWith("/assets") || startsWith("/public")
					// get image from local assets
					//
				}
			}
		}
	}

	// Return Download Infos
	const blob = doc.output("blob");
	const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2) as unknown as number;
	return {
		blob,
		sizeInMB,
	};
};

export const createDownloadPDF = async (
	t: any,
	skip: string | null,
	floodRiskResult: any,
	hazardEntities: any,
	currentUserAddress: any,
	collectImages: any,
) => {
	const doc = new jsPDF({
		unit: "mm",
		format: "a4",
	});

	const paddingHorizontal = mm(40);
	const paddingVertical = mm(30);
	const pageInnerWidth = mm(515);
	const pageInnerHeight = mm(782);
	const gap = 20;
	const leftHalfOfThePage = pageInnerWidth / 2 - mm(gap);
	const takeImage = "makeImage"; // "downscaledImage" || "makeImage"

	// Changing Values
	let vertical = paddingVertical;
	let pageCounter = 0;

	// PDF utils
	const writeTextOnPDF = (props: any): any => {
		if (!props) {
			return;
		}

		const {
			text,
			size,
			weight,
			x,
			y,
			noLineBreak,
			extraMarginBottom,
			maxWidth,
		} = props;

		if (!text) {
			return;
		}

		let setSize = 12;
		if (size === "small") {
			setSize = 9;
		} else if (size === "h1") {
			setSize = 25;
		} else if (size === "h2") {
			setSize = 18;
		}
		const setLineHeight = mm(setSize * 1.1);
		const setMaxWidth = maxWidth ? leftHalfOfThePage : pageInnerWidth;

		doc.setFontSize(setSize);

		if (weight === "b") {
			doc.setFont("Arial", "bold");
		} else {
			doc.setFont("Arial", "normal");
		}
		const lines = doc.splitTextToSize(text, setMaxWidth);

		const posX =
			x === "right"
				? pageInnerWidth + paddingHorizontal - doc.getTextWidth(text)
				: (x ?? paddingHorizontal);
		const posY = y ?? vertical;

		if (lines.length === 1) {
			doc.text(lines[0], posX, posY, {
				maxWidth: setMaxWidth,
				lineHeightFactor: 1.5,
			});
		} else {
			lines.forEach((line: string, index: number) => {
				doc.text(line, posX, posY + index * setLineHeight, {
					maxWidth: setMaxWidth,
				});
			});
		}

		if (!noLineBreak) {
			vertical += lines.length * setLineHeight;
		}

		if (typeof extraMarginBottom === "number") {
			vertical += mm(extraMarginBottom);
		}
	};
	const makeHeader = () => {
		if (pageCounter > 0) {
			doc.addPage();
			vertical = paddingVertical;
		}
		const logoWidth = mm(150);
		const logoHeight = mm(30);
		doc.addImage(
			LogoSMVKU.src,
			"JPEG",
			paddingHorizontal,
			vertical,
			logoWidth,
			logoHeight,
		);
		vertical += logoHeight + mm(30);
		pageCounter++;
		const pageNumber = t("floodCheck.reportDownload.pdf.page", {
			current: pageCounter,
			total: !skip ? "3" : "1",
		});
		writeTextOnPDF({
			text: t("floodCheck.reportDownload.pdf.pageBottomText"),
			size: "small",
			x: paddingHorizontal,
			y: pageInnerHeight + paddingVertical,
			noLineBreak: true,
		});
		writeTextOnPDF({
			text: pageNumber,
			size: "small",
			x: "right",
			y: pageInnerHeight + paddingVertical,
			noLineBreak: true,
		});
		writeTextOnPDF({
			text: t("floodCheck.reportDownload.pdf.title"),
			size: "h1",
			weight: "b",
		});
		writeTextOnPDF({
			text: t("floodCheck.reportDownload.pdf.subTitle"),
			size: "h2",
			weight: "b",
			extraMarginBottom: gap,
		});
	};

	doc.addFileToVFS("Arial.ttf", ArialNormal);
	doc.addFont("Arial.ttf", "Arial", "normal");
	doc.addFileToVFS("Arial-Bold.ttf", ArialBold);
	doc.addFont("Arial-Bold.ttf", "Arial", "bold");

	// Page 1
	makeHeader();

	// Report Date
	const reportDate = t("floodCheck.reportDownload.pdf.date", {
		date: getToday(),
	});
	writeTextOnPDF({
		text: reportDate,
		x: "right",
		extraMarginBottom: gap,
	});
	writeTextOnPDF({
		text: t("floodCheck.reportDownload.pdf.locationTitle"),
	});
	doc.addImage(
		LocationDot.src,
		"JPEG",
		paddingHorizontal,
		vertical,
		mm(15 * 0.75),
		mm(15),
	);

	vertical += mm(12);

	writeTextOnPDF({
		text: currentUserAddress?.label,
		x: paddingHorizontal + mm(20),
		extraMarginBottom: gap,
	});

	if (hazardEntities) {
		for (let index = 0; index < hazardEntities.length; index++) {
			const entity = hazardEntities[index];
			const getIntroLine = t("floodCheck.reportDownload.pdf.hazardIntro", {
				hazard: entity.name === "heavyRain" ? "Starkregen" : "Flusshochwasser",
			});
			writeTextOnPDF({
				text: getIntroLine,
				noLineBreak: true,
			});
			writeTextOnPDF({
				text: translateHazardLevels(entity.hazardLevel),
				weight: "b",
				x: paddingHorizontal + doc.getTextWidth(getIntroLine) + mm(5),
			});
			if (collectImages?.length > 0) {
				const findID =
					entity.name === "heavyRain"
						? "heavyRainWidget"
						: "fluvialFloodWidget";
				const findEntityImage = collectImages.find(
					(collectImage: any) => collectImage.id === findID,
				)[takeImage];
				const findHeavyRainMap = collectImages.find(
					(collectImage: any) => collectImage.id === "map-root-sr",
				)[takeImage];
				const findFluvialFloodMap = collectImages.find(
					(collectImage: any) => collectImage.id === "map-root-hw",
				)[takeImage];
				const mapImage =
					entity.name === "heavyRain" ? findHeavyRainMap : findFluvialFloodMap;
				const imgAspectWidget = await getAspectRatio(findEntityImage);
				const imgAspectMapImage = await getAspectRatio(mapImage);
				const availableSpace = pageInnerWidth - mm(gap);
				const widgetWidth = availableSpace * (2 / 6);
				const widgetHeight = widgetWidth / imgAspectWidget.aspectRatio;
				const mapImageWidth = availableSpace * (4 / 6);
				const mapImageHeight = mapImageWidth / imgAspectMapImage.aspectRatio;
				doc.addImage(
					findEntityImage,
					"JPEG",
					paddingHorizontal,
					vertical,
					widgetWidth,
					widgetHeight,
				);
				doc.addImage(
					mapImage,
					"JPEG",
					paddingHorizontal + widgetWidth + mm(gap),
					vertical,
					mapImageWidth,
					mapImageHeight,
				);
				vertical +=
					widgetHeight > mapImageHeight ? widgetHeight : mapImageHeight;
				vertical += mm(30);
			}
		}
	}

	writeTextOnPDF({
		text: t("floodCheck.reportDownload.pdf.calcHintTitle"),
		weight: "b",
		size: "small",
		extraMarginBottom: mm(10),
	});
	writeTextOnPDF({
		text: t("floodCheck.reportDownload.pdf.calcHintText"),
		size: "small",
	});

	if (!skip) {
		makeHeader();
		writeTextOnPDF({
			text: t("floodCheck.reportDownload.pdf.riskTitle"),
			noLineBreak: true,
		});
		if (floodRiskResult) {
			writeTextOnPDF({
				text: translateHazardLevels(floodRiskResult?.riskLevel),
				weight: "b",
				x:
					paddingHorizontal +
					doc.getTextWidth(t("floodCheck.reportDownload.pdf.riskTitle")) +
					mm(5),
			});
		}
		const findRiskBlock = collectImages.find(
			(collectImage: any) => collectImage.id === "risk-block",
		)[takeImage];
		if (findRiskBlock) {
			let imgAspect = await getAspectRatio(findRiskBlock);
			let imgWidth = (pageInnerWidth - mm(gap)) / 2;
			let imgHeight = imgWidth / imgAspect.aspectRatio;
			doc.addImage(
				findRiskBlock,
				"JPEG",
				paddingHorizontal,
				vertical,
				imgWidth,
				imgHeight,
			);
			vertical += imgHeight + mm(gap * 2);
			writeTextOnPDF({
				text: t("floodCheck.buildingRiskAssessment.title"),
				weight: "b",
				extraMarginBottom: mm(gap),
				size: "small",
			});
			writeTextOnPDF({
				text: t("floodCheck.buildingRiskAssessment.description2"),
				size: "small",
			});
		}
		makeHeader();
		writeTextOnPDF({
			text: t("floodCheck.reportDownload.pdf.tipTitle"),
			weight: "b",
		});
		const findProtestionTips = collectImages.find(
			(collectImage: any) => collectImage.id === "protection-tips",
		)[takeImage];
		if (findProtestionTips) {
			const imgAspect = await getAspectRatio(findProtestionTips);
			let imgWidth: number;
			let imgHeight: number;
			if (imgAspect.aspectRatio >= 1) {
				imgWidth = pageInnerWidth;
				imgHeight = imgWidth / imgAspect.aspectRatio;
			} else {
				imgHeight = pageInnerHeight - vertical;
				imgWidth = imgHeight * imgAspect.aspectRatio;
			}
			doc.addImage(
				findProtestionTips,
				"JPEG",
				paddingHorizontal,
				vertical,
				imgWidth,
				imgHeight,
			);
		}
	}

	// Download
	const blob = doc.output("blob");
	const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2) as unknown as number;
	return {
		blob,
		sizeInMB,
	};
};
