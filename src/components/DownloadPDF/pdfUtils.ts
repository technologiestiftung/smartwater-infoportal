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

// Utils to create PDF
const pxToMm = (px: number, dpi = 96) => (px / dpi) * 25.4;

function parseBoldText(input: string) {
	const chunks = [];

	const regex = /<b>(.*?)<\/b>/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(input)) !== null) {
		// normal text before <b>
		if (match.index > lastIndex) {
			chunks.push({
				text: input.slice(lastIndex, match.index),
				bold: false,
			});
		}

		// bold text
		chunks.push({
			text: match[1],
			bold: true,
		});

		lastIndex = regex.lastIndex;
	}

	// remaining text
	if (lastIndex < input.length) {
		chunks.push({
			text: input.slice(lastIndex),
			bold: false,
		});
	}

	return chunks;
}

interface PDFPageItem {
	// Text Item
	text?: string;
	fontSize?: "small" | "normal" | "h1" | "h2" | "h3" | number;
	lineHeight?: "wide" | number;
	fontWeight?: "normal" | "bold";
	textAlign?: "left" | "center" | "right";
	maxWidthOfText?: "halfPage" | "fullPage" | number;
	textDecoration?: "underline";
	// Image Item
	imageSRC?: string;
	width?: "halfPage" | "fullPage" | string | number;
	height?: number;
	caption?: string;
	copyright?: string;
	// Both Items
	nextElementOnSameLine?: boolean;
	marginBottom?: "paragraph" | number;
	marginLeft?: "halfPage" | number;
	hide?: string;
}

export interface PDFProps {
	name: string;
	showPageNumbers?: boolean;
	pagesPaddingY?: number;
	pagesPaddingX?: number;
	pages: PDFPageItem[][];
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
			lineHeight,
			fontWeight,
			textAlign,
			y,
			nextElementOnSameLine,
			marginBottom,
			marginLeft,
			maxWidthOfText,
			color,
			textDecoration,
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
		} else if (fontSize === "h3") {
			setSize = 15;
		}
		let setLineHeight = typeof lineHeight === "number" ? lineHeight : 1.5;
		if (lineHeight === "wide") {
			setLineHeight = 1.75;
		}
		const getLineHeight = pxToMm(setSize * setLineHeight);
		const setMaxWidth =
			maxWidthOfText === "halfPage"
				? leftHalfOfThePage
				: typeof maxWidthOfText === "number"
					? maxWidthOfText < 1
						? maxWidthOfText * pageInnerWidth
						: maxWidthOfText
					: pageInnerWidth;

		doc.setFontSize(setSize);

		if (
			fontWeight === "bold" ||
			fontSize === "h1" ||
			fontSize === "h2" ||
			fontSize === "h3"
		) {
			doc.setFont("Arial", "bold");
		} else {
			doc.setFont("Arial", "normal");
		}

		if (color !== undefined) {
			doc.setTextColor(color);
		} else {
			doc.setTextColor(0, 0, 0);
		}

		const lines = doc.splitTextToSize(text, setMaxWidth);

		let posY = y ?? vertical;
		posY += getLineHeight;

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
			if (line.includes("<b>")) {
				const boldTextChunks = parseBoldText(line);
				let cursorX = posX;
				boldTextChunks.forEach((chunk) => {
					if (chunk.bold) {
						doc.setFont("Arial", "bold");
					} else {
						doc.setFont("Arial", "normal");
					}
					doc.text(chunk.text, cursorX, posY + index * getLineHeight);
					cursorX += doc.getTextWidth(chunk.text);
				});
			} else {
				doc.text(line, posX, posY + index * getLineHeight, {
					maxWidth: setMaxWidth,
				});
			}
		});

		if (!nextElementOnSameLine) {
			vertical += lines.length * getLineHeight;
		}

		if (typeof marginBottom === "number") {
			vertical += marginBottom;
		} else if (marginBottom === "paragraph") {
			vertical += getLineHeight;
		}
	};

	// Add Arial Font
	doc.addFileToVFS("Arial.ttf", ArialNormal);
	doc.addFont("Arial.ttf", "Arial", "normal");
	doc.addFileToVFS("Arial-Bold.ttf", ArialBold);
	doc.addFont("Arial-Bold.ttf", "Arial", "bold");

	// Changing Values
	let vertical = pagesPaddingY;

	const newPage = () => {
		doc.addPage();
		vertical = pagesPaddingY;
	};

	for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
		const pageItems = pages[pageIndex];

		if (pageIndex > 0) {
			newPage();
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

		if (pageItems && pageItems.length > 0) {
			for (let itemIndex = 0; itemIndex < pageItems.length; itemIndex++) {
				const item = pageItems[itemIndex];
				let hide = false;
				if (pdfKeys) {
					Object.keys(pdfKeys).forEach((key) => {
						const value = pdfKeys[key];
						const isNegative = item.hide?.startsWith("!{");
						let getKey = item.hide;
						if (isNegative) {
							getKey = getKey?.replace("!{", "{");
						}
						if (getKey === key) {
							hide = value;
							if (isNegative) {
								hide = !value;
							}
						}
					});
				}
				if (hide) {
					continue;
				}
				if (vertical > 297 - pagesPaddingY) {
					newPage();
				}
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
						lineHeight: item.lineHeight,
						fontWeight: item.fontWeight,
						textAlign: item.textAlign,
						nextElementOnSameLine: item.nextElementOnSameLine,
						marginBottom: item.marginBottom,
						marginLeft: item.marginLeft,
						maxWidthOfText: item.maxWidthOfText,
						textDecoration: item.textDecoration,
					});
				} else if (item.imageSRC) {
					const image = await getImage(item.imageSRC);
					// console.info("getImage :>> ", image);
					if (image) {
						const marginLeft =
							item.marginLeft === "halfPage"
								? leftHalfOfThePage + gap
								: typeof item.marginLeft === "number"
									? item.marginLeft < 1
										? pageInnerWidth * item.marginLeft + pagesPaddingX
										: item.marginLeft + pagesPaddingX
									: (pagesPaddingX ?? 0);

						const hasWidth = typeof item.width === "number";
						const hasHeight = typeof item.height === "number";

						let drawWidth: number;
						let drawHeight: number;

						if (hasWidth) {
							if ((item.width as number) < 1) {
								drawWidth = pageInnerWidth * (item.width as number);
							} else {
								drawWidth = item.width as number;
							}
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

						doc.addImage(
							image.image,
							"JPEG",
							marginLeft,
							vertical,
							drawWidth,
							drawHeight,
						);

						if (!item.nextElementOnSameLine) {
							vertical += drawHeight;
						}

						if (item.caption) {
							vertical += 1;
							writeTextOnPDF({
								text: item.caption,
								fontSize: "small",
							});
						}
						if (item.copyright) {
							vertical += 1;
							writeTextOnPDF({
								text: item.copyright,
								fontSize: "small",
								color: "#666666",
							});
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
