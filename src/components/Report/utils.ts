/* eslint-disable complexity */
import jsPDF from "jspdf";

type TextChunk = {
	text: string;
	bold?: boolean;
	italic?: boolean;
	href?: string;
};

export function parseRichTextToChunks(input: string): TextChunk[] {
	const chunks: TextChunk[] = [];
	const re =
		/<b>([\s\S]*?)<\/b>|<i>([\s\S]*?)<\/i>|<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = re.exec(input)) !== null) {
		if (match.index > lastIndex) {
			chunks.push({ text: input.slice(lastIndex, match.index) });
		}

		if (match[1] !== undefined) {
			chunks.push({ text: match[1], bold: true });
		} else if (match[2] !== undefined) {
			chunks.push({ text: match[2], italic: true });
		} else if (match[3] !== undefined && match[4] !== undefined) {
			chunks.push({ text: match[4], href: match[3] });
		}

		lastIndex = re.lastIndex;
	}

	if (lastIndex < input.length) {
		chunks.push({ text: input.slice(lastIndex) });
	}

	return chunks.filter((c) => c.text.length > 0);
}

type WrappedLine = TextChunk[];

export function wrapChunksToLines(
	doc: jsPDF,
	chunks: TextChunk[],
	maxWidth: number,
): WrappedLine[] {
	const lines: WrappedLine[] = [];
	let currentLine: TextChunk[] = [];
	let currentWidth = 0;

	const pushLine = () => {
		lines.push(currentLine);
		currentLine = [];
		currentWidth = 0;
	};

	for (const chunk of chunks) {
		// const tokens = chunk.text.split(/(\s+)/).filter((t) => t.length > 0);
		const tokens = chunk.text
			.split(/(<br\s*\/?>|\s+)/i)
			.filter((t) => t && t.length > 0);

		for (const token of tokens) {
			if (/^<br\s*\/?>$/i.test(token)) {
				// finish current line (if any)
				if (currentLine.length) {
					pushLine();
				}

				// add an empty line (this is the “second break”)
				lines.push([]);

				// start fresh line after the breaks
				currentLine = [];
				currentWidth = 0;
				continue;
			}
			// measure token width in correct font
			if (chunk.bold) {
				doc.setFont("Arial", "bold");
			} else if (chunk.italic) {
				doc.setFont("Arial", "italic");
			} else {
				doc.setFont("Arial", "normal");
			}
			const tokenWidth = doc.getTextWidth(token);

			if (currentWidth > 0 && currentWidth + tokenWidth > maxWidth) {
				// new line
				pushLine();
			}

			currentLine.push({ ...chunk, text: token });
			currentWidth += tokenWidth;
		}
	}

	if (currentLine.length) {
		pushLine();
	}
	return lines;
}

export const getToday = (): string => {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");
	const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const year = today.getFullYear();
	return `${day}.${month}.${year}`;
};

export function pxToPt(px: number, dpi = 96): number {
	return px * (72 / dpi);
}

export function ptToMm(pt: number): number {
	return (pt * 25.4) / 72;
}

export const translateHazardLevels = (level: string): string => {
	if (!level) {
		return "";
	}
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

export const translateHazardTags = (
	value: string | number,
	questionID: string,
): string => {
	if (questionID === "q1") {
		if (value === "yesWithWindow") {
			return "/Red.png";
		} else if (value === "yesWithoutWindow") {
			return "/Orange.png";
		} else if (value === "no") {
			return "/Green.png";
		}
	}
	if (questionID === "q2") {
		if (value === "lowValue") {
			return "/Green.png";
		}
		return "/Red.png";
	}
	if (questionID === "q3") {
		if (typeof value === "string" && value.startsWith("no")) {
			return "/Red.png";
		} else if (value === "yesUnknown") {
			return "/Orange.png";
		} else if (value === "yesGood") {
			return "/Green.png";
		}
	}
	if (questionID === "q4") {
		if (value === "bad") {
			return "/Red.png";
		}
		return "/Green.png";
	}
	if (questionID === "q5" || questionID === "qA") {
		if (value === "yes") {
			return "/Red.png";
		}
		return "/Green.png";
	}
	if (questionID === "qB" || questionID === "qC") {
		if (typeof value === "number") {
			if (value > 1) {
				return "/Red.png";
			} else if (value === 1) {
				return "/Orange.png";
			} else if (value === 0) {
				if (questionID === "qB") {
					return "/Green.png";
				}
				return "/Orange.png";
			}
		}
	}
	return "/Grey.png";
};

export const translateWMSValue = (
	value: string | number | null | undefined,
	helper: string = "bis zu ",
	unit: string = "cm",
): string => {
	if (!value) {
		return "Keine Daten";
	}
	return `${helper}${value}${unit}`;
};
