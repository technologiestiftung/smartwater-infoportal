/* eslint-disable complexity */
import {
	FloodRiskAnswers,
	FloodRiskResult,
	LocationData,
	RiskFactor,
} from "@/lib/types";
import { getScenarioDomId } from "@/lib/utils/mapUtils";
import { Scenario, ScreenshotRequestBody } from "@/types/map";
import { HazardEntity } from "@/utils/storeUtils";
import jsPDF from "jspdf";
import { PDFKeys } from "./types";
import floodRiskConfig from "@/config/floodRiskConfig.json";
import { calculateRiskLevel } from "@/lib/utils";

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

export const getToday = (reverse = false): string => {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");
	const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const year = today.getFullYear();
	if (reverse) {
		return `${year}-${month}-${day}`;
	}
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
	if (level === "none") {
		return "Keine";
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

const translateHazardTags = (
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
			return "/Orange.png";
		}
		return "/Red.png";
	}
	if (questionID === "q3") {
		if (typeof value === "string" && value.startsWith("no")) {
			if (value === "noInformation") {
				return "/Red-Q.png";
			}
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
			/* if (+answer.value <= 1) return "low";
		if (+answer.value <= 2) return "moderate";
		if (+answer.value >= 3) return "high"; */
			if (value <= 1) {
				if (questionID === "qB") {
					return "/Green.png";
				}
				return "/Orange.png";
			} else if (value <= 2) {
				return "/Orange.png";
			}
			return "/Red.png";
			/* if (value > 1) {
				return "/Red.png";
			} else if (value === 1) {
				return "/Orange.png";
			} else  */
		}
	}
	return "/Grey.png";
};

export const getScreenshotForScenario = async (
	scenario: string,
	locationData?: LocationData | null,
	hazardEntities?: HazardEntity[] | null,
	floodRiskResult?: FloodRiskResult | null,
	floodRiskAnswers?: FloodRiskAnswers | null,
): Promise<{
	key: string;
	blob: Blob;
}> => {
	let path = "";
	let key: string = scenario;

	const body: ScreenshotRequestBody = { url: "" };

	if (scenario === "risk-block") {
		path = `/riskblock-screenshot`;
		body.floodRiskResultDown = floodRiskResult;
		body.floodRiskAnswersDown = floodRiskAnswers;
		body.hazardEntitiesDown = hazardEntities;
	} else if (scenario.includes("Widget")) {
		const findHazardEntity = hazardEntities?.filter(
			(entity) => entity.name === scenario.replace("Widget", ""),
		)[0];
		if (findHazardEntity) {
			path = "/widget-screenshot";
			body.hazardEntity = findHazardEntity;
		}
	} else {
		key = getScenarioDomId(scenario as Scenario);
		path = `/scenario-map?scenario=${scenario}`;
		body.buildingGeometry = locationData?.building?.geometry;
		body.outlineBufferGeometry = locationData?.building?.outlineBufferGeometry;
	}
	body.url = `${window.location.origin}${path}`;
	const res = await fetch("/api/screenshot", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const text = await res.text();

	if (!res.ok) {
		throw new Error(`Screenshot API failed (${res.status}): ${text}`);
	}

	const data = JSON.parse(text);
	const { imageBase64 } = data;
	const dataUrl = `data:image/jpeg;base64,${imageBase64}`;
	const blob = await fetch(dataUrl).then((r) => r.blob());
	return { key, blob };
};

export const translateWMSValue = (
	value: string | number | null | undefined,
	helper: string = "bis zu ",
	unit: string = "cm",
): string => {
	if (!value) {
		return "Keine Daten";
	}
	return `${helper}${Math.round(+value)}${unit}`;
};

export const getDefaultRiskFactors = (
	floodRiskAnswers: FloodRiskAnswers,
	hazardEntities: HazardEntity[],
	t: (key: string) => string = (key) => key,
): RiskFactor[] => {
	return floodRiskConfig.riskFactors
		.map((factor) => {
			const riskLevel = calculateRiskLevel(
				factor.questionId,
				floodRiskAnswers,
				hazardEntities,
			);
			return {
				id: factor.id,
				riskLevel,
				translationKey: factor.translationKey,
				hasInfo: factor.id === "floodplain",
				name: t(factor.translationKey),
				description: t(factor.translationKey.replace("title", riskLevel)),
				tag: translateHazardTags(
					floodRiskAnswers?.[factor.questionId]?.value as string,
					factor.questionId,
				),
			};
		})
		.filter((factor) => {
			if (
				!floodRiskAnswers ||
				(factor.riskLevel === "dontKnow" && factor.id !== "backflowProtection")
			)
				return false;
			const isThereABasement = !floodRiskAnswers["q1"]?.value
				.toString()
				.startsWith("no");
			if (factor.id === "basementUsage" && !isThereABasement) {
				return false;
			}
			return true;
		});
};

export const populatePDFKeysWithFloodRiskAnswers = (
	floodRiskAnswers: FloodRiskAnswers,
	skip: boolean,
	hazardEntities: HazardEntity[],
	t: (key: string) => string = (key) => key,
): PDFKeys => {
	const isThereABasement = !floodRiskAnswers["q1"]?.value
		.toString()
		.startsWith("no");

	const pdfKeys: PDFKeys = {
		"{isOwner}":
			typeof floodRiskAnswers?.q0?.value === "string" &&
			floodRiskAnswers?.q0?.value?.includes("Owner"),
		"{basementWithWindows}": floodRiskAnswers?.q1?.value === "yesWithWindow",
		"{basementWithoutWindows}":
			floodRiskAnswers?.q1?.value === "yesWithoutWindow",
		"{backflowProtectionIsGood}":
			!!skip || floodRiskAnswers?.q3?.value === "yesGood",
		"{noBasementUsageHazard}": !floodRiskAnswers?.q2,
		"{noPropertyDrainageHazard}":
			floodRiskAnswers?.q4?.value === "noInformation",
		"{noPastDamages}": floodRiskAnswers?.q5?.value === "noInformation",
		"{isThereABasement}": isThereABasement,
	};

	const defaultRiskFactors = getDefaultRiskFactors(
		floodRiskAnswers,
		hazardEntities ?? [],
		t,
	);

	for (const factor of defaultRiskFactors) {
		pdfKeys[`{${factor.id}Tag}`] = factor.tag;
		pdfKeys[`{${factor.id}Name}`] = factor.name;
		pdfKeys[`{${factor.id}Description}`] = factor.description;
	}
	return pdfKeys;
};
