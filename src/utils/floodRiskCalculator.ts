import { FloodRiskAnswers, FloodRiskResult, LocationData } from "@/lib/types";
import riskConfig from "@/config/floodRiskConfig.json";

export function calculateFloodRiskScore(
	answers: FloodRiskAnswers,
): FloodRiskResult {
	let totalScore = 0;
	let counter = 0;

	// Calculate score from stored answers
	Object.entries(answers).forEach(([_, questionAnswer]) => {
		if (questionAnswer?.score !== undefined) {
			totalScore += questionAnswer.score;
			counter += questionAnswer.addToCounter;
		}
	});

	const evaluation = totalScore / counter;

	const { low, moderate, high } = riskConfig.riskThresholds;

	let riskLevel: FloodRiskResult["riskLevel"];

	if (evaluation >= low.min && evaluation <= low.max) {
		riskLevel = "low";
	} else if (evaluation >= moderate.min && evaluation <= moderate.max) {
		riskLevel = "moderate";
	} else if (evaluation >= high.min && evaluation <= high.max) {
		riskLevel = "high";
	} else {
		riskLevel = "insufficient-data";
	}

	return {
		totalScore,
		counter,
		evaluation,
		riskLevel,
	};
}

export function calculateQuestionScore(
	questionId: string,
	value: string | string[] | number,
): { score: number; addToCounter: number } {
	// Find question config
	const questionConfig = riskConfig.questions.find((q) => q.id === questionId);
	if (!questionConfig) {
		return { score: 0, addToCounter: 0 };
	}

	let score = 0;
	let addToCounter = 0;

	const optionConfig = questionConfig.options.find(
		(opt) => opt.value === value,
	);
	if (optionConfig) {
		score = optionConfig.score;
		addToCounter = optionConfig.addToCounter || 0;
	}

	return {
		score,
		addToCounter,
	};
}

export function calculateQuestionScoreFromMultiple(
	questionId: string,
	value: string | string[] | number,
): { score: number; addToCounter: number } {
	// Find question config
	const questionConfig = riskConfig.questions.find((q) => q.id === questionId);
	if (!questionConfig) {
		return { score: 0, addToCounter: 0 };
	}

	let score = 0;
	let addToCounter = 0;

	if (Array.isArray(value)) {
		// Multiple choice - sum all scores
		value.forEach((option) => {
			const optionConfig = questionConfig.options.find(
				(opt) => opt.value === option,
			);
			if (optionConfig) {
				score += optionConfig.score;
				addToCounter += optionConfig.addToCounter || 0;
			}
		});
	} else {
		// Single choice
		const optionConfig = questionConfig.options.find(
			(opt) => opt.value === value,
		);
		if (optionConfig) {
			score = optionConfig.score;
			addToCounter = optionConfig.addToCounter || 0;
		}
	}

	return { score, addToCounter };
}

export function prePopulateFromLocationData(
	locationData: LocationData | null,
): FloodRiskAnswers {
	if (!locationData) {
		return {};
	}

	const autoQuestions = riskConfig.questions.filter((q) => q.type === "auto");

	const getNestedValue = (obj: unknown, path: string): unknown => {
		return path
			.split(".")
			.reduce(
				(current, key) => (current as Record<string, unknown>)?.[key],
				obj,
			);
	};

	const transforms: Record<string, (value: unknown) => unknown> = {
		floodZoneBool: (value: unknown) =>
			value && (value as number) > 0 ? "yes" : "no",
	};

	const answers: FloodRiskAnswers = {};

	autoQuestions.forEach((question) => {
		const questionAny = question as Record<string, unknown>; // Type assertion to access dataPath
		if (!questionAny.dataPath) {
			return;
		}

		let value = getNestedValue(locationData, questionAny.dataPath as string);

		// Apply transform if specified
		if (questionAny.transform && transforms[questionAny.transform as string]) {
			value = transforms[questionAny.transform as string](value);
		}

		if (value !== undefined) {
			const getCalc = calculateQuestionScore(
				question.id,
				value as string | string[] | number,
			);
			answers[question.id] = {
				value: value as string | string[] | number,
				score: getCalc.score,
				addToCounter: getCalc.addToCounter,
			};
		}
	});

	return answers;
}
