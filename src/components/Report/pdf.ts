/* eslint-disable */

import jsPDF from "jspdf";
import ArialBold from "./assets/arial-bold";
import ArialNormal from "./assets/arial-normal";
import ArialItalic from "./assets/arial-italic";
import { getImage } from "./pdfImageUtils";
import { WritePDFPageItem, PDFPageItem, PDFProps } from "./types";
import {
	parseRichTextToChunks,
	wrapChunksToLines,
	pxToPt,
	ptToMm,
} from "./utils";

export const drawPDF = async (pdf: PDFProps, pdfKeys: any) => {
	if (!pdf) {
		console.error("No PDF data provided");
		return null;
	}

	// Initialize jsPDF
	const doc = new jsPDF({
		unit: "mm",
		format: "a4",
	});

	// PDF Variables
	const {
		pagesPaddingTop: paddingTop,
		pagesPaddingBottom: paddingBottom,
		pagesPaddingX: paddingX,
		pages,
		header,
		footer,
	} = pdf;
	const pagesPaddingTop = paddingTop || 30;
	const pagesPaddingBottom = paddingBottom || 25;
	const pagesPaddingX = paddingX || 25;
	const horizontalGap = 3;
	const pageInnerWidth = 210 - 2 * pagesPaddingX;
	const halfOfThePage = pageInnerWidth / 2 - horizontalGap / 2;

	// Add Font
	doc.addFileToVFS("Arial.ttf", ArialNormal);
	doc.addFont("Arial.ttf", "Arial", "normal");
	doc.addFileToVFS("Arial-Bold.ttf", ArialBold);
	doc.addFont("Arial-Bold.ttf", "Arial", "bold");
	doc.addFileToVFS("Arial-Italic.ttf", ArialItalic);
	doc.addFont("Arial-Italic.ttf", "Arial", "italic");

	// Functions
	const writeText = (props: WritePDFPageItem) => {
		if (!props) {
			return;
		}

		const {
			text,
			fontSize,
			lineHeight,
			fontWeight,
			textAlign,
			nextElementOnSameLine,
			marginBottom,
			marginLeft,
			maxWidth,
			color,
			backgroundColor,
		} = props;

		if (!text) {
			return;
		}

		let setSize = typeof fontSize === "number" ? fontSize : 14;
		if (fontSize === "small") setSize = 12;
		else if (fontSize === "h1") setSize = 24;
		else if (fontSize === "h2") setSize = 20;
		else if (fontSize === "h3") setSize = 17;

		let setLineHeight = typeof lineHeight === "number" ? lineHeight : 1.3;
		if (lineHeight === "wide") setLineHeight = 1.5;
		if (lineHeight === "narrow") setLineHeight = 1.15;
		if (fontSize?.toString().startsWith("h")) setLineHeight = 1;

		const fontPt = pxToPt(setSize);
		const getLineHeight = ptToMm(fontPt * setLineHeight);

		doc.setFontSize(fontPt);

		if (color !== undefined) {
			doc.setTextColor(color);
		} else {
			doc.setTextColor(0, 0, 0);
		}

		const paddingOnBackgroundColor = backgroundColor ? 3 : 0;

		let setMaxWidth =
			maxWidth === "halfPage"
				? halfOfThePage
				: typeof maxWidth === "number"
					? maxWidth < 1
						? maxWidth * pageInnerWidth
						: maxWidth
					: pageInnerWidth;

		if (backgroundColor) {
			setMaxWidth -= paddingOnBackgroundColor * 2;
		}

		const chunks = parseRichTextToChunks(text);
		const wrappedLines = wrapChunksToLines(doc, chunks, setMaxWidth);

		const blockWidth = setMaxWidth + paddingOnBackgroundColor * 2;
		const blockHeight =
			(wrappedLines.length * getLineHeight + paddingOnBackgroundColor * 2) *
			1.02;

		let posY = vertical;
		posY += getLineHeight;

		let baseX =
			textAlign === "right"
				? pageInnerWidth + pagesPaddingX - blockWidth
				: textAlign === "center"
					? pagesPaddingX + (pageInnerWidth - blockWidth) / 2
					: pagesPaddingX;

		if (marginLeft === "halfPage") {
			baseX += halfOfThePage + horizontalGap;
		} else if (typeof marginLeft === "number") {
			baseX += marginLeft;
		}

		const rectY = posY - getLineHeight;

		if (backgroundColor) {
			doc.setFillColor(backgroundColor);
			doc.rect(baseX, rectY, blockWidth, blockHeight, "F");
		}

		wrappedLines.forEach((lineChunks, index) => {
			const lineWidth = lineChunks.reduce((sum, c) => {
				if (fontWeight === "bold") {
					doc.setFont("Arial", "bold");
				} else if (fontWeight === "italic") {
					doc.setFont("Arial", "italic");
				} else {
					doc.setFont("Arial", "normal");
				}
				return sum + doc.getTextWidth(c.text);
			}, 0);

			let posX =
				textAlign === "right"
					? pageInnerWidth + pagesPaddingX - lineWidth
					: textAlign === "center"
						? pagesPaddingX + (pageInnerWidth - lineWidth) / 2
						: pagesPaddingX;

			if (marginLeft === "halfPage") {
				posX += halfOfThePage + horizontalGap;
			} else if (typeof marginLeft === "number") {
				if (marginLeft < 1) {
					posX =
						(pageInnerWidth - horizontalGap) * marginLeft +
						pagesPaddingX +
						horizontalGap;
				} else {
					posX += marginLeft;
				}
			}

			const drawY = posY + index * getLineHeight + paddingOnBackgroundColor;
			let cursorX = posX + paddingOnBackgroundColor;

			lineChunks.forEach((chunk, indexChunk) => {
				if (chunk.text === " " && !indexChunk) return;
				if (
					chunk.bold ||
					fontWeight === "bold" ||
					fontSize === "h1" ||
					fontSize === "h2" ||
					fontSize === "h3"
				) {
					doc.setFont("Arial", "bold");
				} else if (chunk.italic || fontWeight === "italic") {
					doc.setFont("Arial", "italic");
				} else {
					doc.setFont("Arial", "normal");
				}
				if (chunk.href) {
					doc.setTextColor(0, 71, 211);
				} else {
					if (color !== undefined) {
						doc.setTextColor(color);
					} else {
						doc.setTextColor(0, 0, 0);
					}
				}
				doc.text(chunk.text, cursorX, drawY);

				const w = doc.getTextWidth(chunk.text);

				if (chunk.href) {
					doc.link(cursorX, drawY - setSize * 0.8, w, setSize * 1.1, {
						url: chunk.href,
					});
				}

				cursorX += w;
			});
		});

		if (!nextElementOnSameLine) {
			if (backgroundColor) {
				vertical += blockHeight;
			} else {
				vertical += wrappedLines.length * getLineHeight;
			}
		}

		if (typeof marginBottom === "number") {
			vertical += marginBottom;
		} else if (marginBottom === "paragraph") {
			vertical += getLineHeight;
		}
	};
	const getHideValue = (hideString: string | undefined): boolean => {
		if (!hideString || !pdfKeys) {
			return false;
		}
		let hide = false;
		Object.keys(pdfKeys).forEach((key) => {
			const value = pdfKeys[key];
			const isNegative = hideString?.startsWith("!{");
			let getKey = hideString;
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
		return hide;
	};

	// Initial Values
	const filteredPages = pages.filter((page) => {
		const hidePage = getHideValue(page.hide);
		return !hidePage;
	});
	let vertical = pagesPaddingTop;

	// Draw PDF Pages
	for (let pageIndex = 0; pageIndex < filteredPages.length; pageIndex++) {
		// Functions
		const drawItem = async (item: PDFPageItem) => {
			if (item.text) {
				let text = item.text;
				if (item.text === "{pageNumber}") {
					const pageNumber = `Seite ${pageIndex + 1} von ${filteredPages.length}`;
					text = pageNumber;
				}
				if (pdfKeys) {
					Object.keys(pdfKeys).forEach((key) => {
						const value = pdfKeys[key];
						text = text.replace(key, value);
					});
				}
				if (item.isListItem) {
					writeText({
						...item,
						text: "• ",
						nextElementOnSameLine: true,
						marginLeft: undefined,
						marginBottom: undefined,
					});
				}
				writeText({
					...item,
					text,
					marginLeft: item.isListItem ? 3 : item.marginLeft,
				});
				return;
			} else if (item.imageSRC) {
				let getImageSRC = item.imageSRC;
				if (pdfKeys && getImageSRC.startsWith("{")) {
					Object.keys(pdfKeys).forEach((key) => {
						const value = pdfKeys[key];
						getImageSRC = getImageSRC.replace(key, value);
					});
				}
				const image = await getImage(getImageSRC, pdfKeys);
				if (image) {
					const marginLeft =
						item.marginLeft === "halfPage"
							? halfOfThePage + horizontalGap + pagesPaddingX
							: typeof item.marginLeft === "number"
								? item.marginLeft < 1
									? (pageInnerWidth - horizontalGap) * item.marginLeft +
										pagesPaddingX +
										horizontalGap
									: item.marginLeft + pagesPaddingX
								: (pagesPaddingX ?? 0);

					const hasWidth = typeof item.width === "number";
					const hasHeight = typeof item.height === "number";

					let drawWidth: number;
					let drawHeight: number;

					if (hasWidth) {
						if ((item.width as number) < 1) {
							drawWidth =
								(pageInnerWidth - horizontalGap) * (item.width as number);
						} else {
							drawWidth = item.width as number;
						}
						drawHeight = drawWidth * image.aspectRatioHeightWidth;
					} else if (hasHeight) {
						drawHeight = item.height as number;
						drawWidth = drawHeight * image.aspectRatioWidthHeight;
					} else if (item.width === "fullPage") {
						drawWidth = pageInnerWidth;
						drawHeight = drawWidth * image.aspectRatioHeightWidth;
					} else if (item.width === "halfPage") {
						drawWidth = halfOfThePage;
						drawHeight = drawWidth * image.aspectRatioHeightWidth;
					} else {
						drawWidth = 50;
						drawHeight = drawWidth * image.aspectRatioHeightWidth;
					}

					doc.addImage(
						image.image,
						"JPEG",
						marginLeft,
						vertical,
						drawWidth,
						drawHeight,
					);

					const verticalBeforeImage = vertical;

					if (item.caption || item.copyright) {
						vertical += drawHeight;
					} else if (
						!item.caption &&
						!item.copyright &&
						!item.nextElementOnSameLine
					) {
						vertical += drawHeight;
					}

					if (item.caption) {
						vertical += 3;
						writeText({
							text: item.caption,
							fontSize: "small",
							maxWidth: drawWidth,
							marginLeft: item.marginLeft,
						});
					}
					if (item.copyright) {
						vertical += 3;
						writeText({
							text: item.copyright,
							fontSize: "small",
							color: "#666666",
							maxWidth: drawWidth,
							marginLeft: item.marginLeft,
						});
					}

					if (item.nextElementOnSameLine) {
						vertical = verticalBeforeImage;
					}

					if (typeof item.marginBottom === "number") {
						vertical += item.marginBottom;
					}
					return;
				}
			} else if (item.spacing) {
				vertical += item.spacing;
			} else if (item.pageBreak) {
				await newPage(true);
			}
			return;
		};
		const drawHeader = async () => {
			if (!header) {
				return;
			}
			for (let headerIndex = 0; headerIndex < header.length; headerIndex++) {
				const headerPage = header[headerIndex];
				await drawItem(headerPage);
			}
			return;
		};

		const drawFooter = async () => {
			if (!footer) {
				return;
			}
			vertical = 297 - pagesPaddingBottom;
			for (let footerIndex = 0; footerIndex < footer.length; footerIndex++) {
				const footerPage = footer[footerIndex];
				await drawItem(footerPage);
			}
			return;
		};
		const newPage = async (drawHeaderAfterNewPage: boolean = false) => {
			doc.addPage();
			await drawFooter();
			vertical = pagesPaddingTop;
			if (drawHeaderAfterNewPage) {
				await drawHeader();
			}
		};

		const pageItems = filteredPages[pageIndex].items;

		if (pageIndex > 0) {
			await newPage();
		} else {
			await drawFooter();
			vertical = pagesPaddingTop;
		}
		await drawHeader();
		if (pageItems && pageItems.length > 0) {
			for (let itemIndex = 0; itemIndex < pageItems.length; itemIndex++) {
				const item = pageItems[itemIndex];
				const getHide = getHideValue(item.hide);
				if (getHide) {
					continue;
				}
				if (vertical > 297 - pagesPaddingBottom - 10) {
					await newPage(true);
				}
				await drawItem(item);
			}
		}
	}

	// Finalize PDF
	doc.setProperties({
		title: pdf.name,
	});
	const blob = doc.output("blob");
	const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2) as unknown as number;
	return {
		blob,
		sizeInMB,
	};
};
