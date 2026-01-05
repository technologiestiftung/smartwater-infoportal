/* eslint-disable */

import jsPDF from "jspdf";
import ArialBold from "./assets/arial-bold";
import ArialNormal from "./assets/arial-normal";
import { getImage } from "./pdfImageUtils";

export const getToday = (): string => {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");
	const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const year = today.getFullYear();
	return `${day}.${month}.${year}`;
};

// Utils to create PDF
const pxToMm = (px: number, dpi = 96) => (px / dpi) * 25.4;

interface PDFPageItem {
	// Text Item
	text?: string;
	fontSize?: "small" | "normal" | "h1" | "h2" | number;
	fontWeight?: "normal" | "bold";
	textAlign?: "left" | "center" | "right";
	maxWidthOfText?: "halfPage" | "fullPage";
	// Image Item
	imageSRC?: string;
	width?: "halfPage" | "fullPage" | number;
	height?: number;
	// Both Items
	nextElementOnSameLine?: boolean;
	marginBottom?: number;
	marginLeft?: "halfPage" | number;
}

interface PDFPages {
	items: PDFPageItem[];
}

export interface PDFProps {
	name: string;
	showPageNumbers?: boolean;
	pagesPaddingY?: number;
	pagesPaddingX?: number;
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
	const pagesPaddingY = paddingY || 15;
	const pagesPaddingX = paddingX || 12;

	const pageInnerWidth = 210 - 2 * pagesPaddingX;
	const gap = 5;
	const leftHalfOfThePage = pageInnerWidth / 2 - gap;

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
			nextElementOnSameLine,
			marginBottom,
			marginLeft,
			maxWidthOfText,
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
		const setLineHeight = pxToMm(setSize * 1.2);
		const setMaxWidth =
			maxWidthOfText === "halfPage" ? leftHalfOfThePage : pageInnerWidth;

		doc.setFontSize(setSize);

		if (fontWeight === "bold") {
			doc.setFont("Arial", "bold");
		} else {
			doc.setFont("Arial", "normal");
		}
		const lines = doc.splitTextToSize(text, setMaxWidth);

		let posY = y ?? vertical;
		posY += setLineHeight;

		lines.forEach((line: string, index: number) => {
			let posX =
				textAlign === "right"
					? pageInnerWidth + pagesPaddingX - doc.getTextWidth(line)
					: textAlign === "center"
						? pagesPaddingX + (pageInnerWidth - doc.getTextWidth(line)) / 2
						: pagesPaddingX;
			if (marginLeft === "halfPage") {
				posX += leftHalfOfThePage + gap;
			} else if (typeof marginLeft === "number") {
				posX += marginLeft;
			}
			doc.text(line, posX, posY + index * setLineHeight, {
				maxWidth: setMaxWidth,
			});
		});

		if (!nextElementOnSameLine) {
			vertical += lines.length * setLineHeight;
		}

		if (typeof marginBottom === "number") {
			vertical += marginBottom;
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

		if (pageIndex > 0) {
			doc.addPage();
			vertical = pagesPaddingY;
		}

		if (showPageNumbers) {
			const pageNumber = `Seite ${pageIndex + 1} von ${pages.length}`;
			writeTextOnPDF({
				text: pageNumber,
				fontSize: "small",
				textAlign: "right",
				y: 297 - pagesPaddingY,
			});
		}

		if (page.items && page.items.length > 0) {
			for (let itemIndex = 0; itemIndex < page.items.length; itemIndex++) {
				const item = page.items[itemIndex];
				console.log("item :>> ", item);
				console.log("vertical :>> ", vertical);
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
						nextElementOnSameLine: item.nextElementOnSameLine,
						marginBottom: item.marginBottom,
						marginLeft: item.marginLeft,
						maxWidthOfText: item.maxWidthOfText,
					});
				} else if (item.imageSRC) {
					const image = await getImage(item.imageSRC);
					// console.info("getImage :>> ", image);
					if (image) {
						const marginLeft =
							item.marginLeft === "halfPage"
								? leftHalfOfThePage + gap
								: typeof item.marginLeft === "number"
									? item.marginLeft
									: (pagesPaddingX ?? 0);

						const hasWidth = typeof item.width === "number";
						const hasHeight = typeof item.height === "number";

						let drawWidth: number;
						let drawHeight: number;

						if (hasWidth) {
							// You know the width, compute height
							drawWidth = item.width as number;
							drawHeight = drawWidth * image.aspectRatioHeightWidth; // ✅ height/width
						} else if (hasHeight) {
							// You know the height, compute width
							drawHeight = item.height as number;
							drawWidth = drawHeight * image.aspectRatioWidthHeight; // ✅ width/height
						} else if (item.width === "fullPage") {
							drawWidth = pageInnerWidth;
							drawHeight = drawWidth * image.aspectRatioHeightWidth; // ✅ keep ratio
						} else if (item.width === "halfPage") {
							drawWidth = pageInnerWidth / 2;
							drawHeight = drawWidth * image.aspectRatioHeightWidth; // ✅
						} else {
							// default
							drawWidth = 50;
							drawHeight = drawWidth * image.aspectRatioHeightWidth; // ✅
						}

						const posY = vertical;
						console.log("addImage", {
							image: image.image,
							typ: "JPEG",
							marginLeft,
							posY,
							drawWidth,
							drawHeight,
						});

						doc.addImage(
							image.image,
							"JPEG",
							marginLeft,
							posY,
							drawWidth,
							drawHeight,
						);

						if (!item.nextElementOnSameLine) {
							vertical += drawHeight;
							vertical += 5;
						}
						if (typeof item.marginBottom === "number") {
							vertical += item.marginBottom;
						}
					}
				}
			}
		}
	}

	const blob = doc.output("blob");
	const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2) as unknown as number;
	return {
		blob,
		sizeInMB,
	};
};
