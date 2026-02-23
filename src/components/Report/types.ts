export interface PDFPageItem {
	// Text Item
	text?: string;
	fontSize?: "small" | "normal" | "h1" | "h2" | "h3" | number;
	lineHeight?: "wide" | "narrow" | number;
	fontWeight?: "normal" | "bold" | "italic";
	textAlign?: "left" | "center" | "right";
	maxWidth?: "halfPage" | "fullPage" | number;
	textDecoration?: "underline";
	backgroundColor?: string;
	isListItem?: boolean;
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
	// Spacing
	spacing?: number;
	// Break to a new page
	pageBreak?: boolean;
}

export interface WritePDFPageItem extends PDFPageItem {
	color?: string;
	y?: number;
}

interface PDFPage {
	items: PDFPageItem[];
	hide?: string;
	title?: string;
}

export interface PDFProps {
	pagesPaddingTop?: number;
	pagesPaddingBottom?: number;
	pagesPaddingX?: number;
	header: PDFPageItem[];
	footer?: PDFPageItem[];
	pages: PDFPage[];
}

export type PDFKeys = Record<string, string | number | boolean | Blob>;
