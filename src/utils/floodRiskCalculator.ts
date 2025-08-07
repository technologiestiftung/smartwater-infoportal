import { FloodRiskAnswers, FloodRiskResult, LocationData } from "@/lib/types";
import riskConfig from "@/config/floodRiskConfig.json";

export function calculateFloodRiskScore(
	answers: FloodRiskAnswers,
): FloodRiskResult {
	let totalScore = 0;
	let answeredCount = 0;

	// Calculate score from stored answers
	Object.entries(answers).forEach(([questionId, questionAnswer]) => {
		if (questionAnswer?.score !== undefined) {
			const questionConfig = riskConfig.questions.find(
				(q) => q.id === questionId,
			);
			const weight = questionConfig?.weight || 1;
			totalScore += questionAnswer.score * weight;
			answeredCount++;
		}
	});

	// Check if we have enough data
	if (answeredCount < riskConfig.minimumAnswersRequired) {
		return {
			totalScore: 0,
			riskLevel: "insufficient-data",
		};
	}

	// Determine risk level based on configurable score ranges
	const { low, moderate, high } = riskConfig.riskThresholds;

	let riskLevel: FloodRiskResult["riskLevel"];

	if (totalScore >= low.min && totalScore <= low.max) {
		riskLevel = "low";
	} else if (totalScore >= moderate.min && totalScore <= moderate.max) {
		riskLevel = "moderate";
	} else if (totalScore <= high.min) {
		riskLevel = "high";
	} else {
		// Fallback - shouldn't happen with proper ranges
		riskLevel = "moderate";
	}

	return {
		totalScore,
		riskLevel,
	};
}

export function calculateQuestionScore(
	questionId: string,
	value: string | string[] | number,
): number {
	// Find question config
	const questionConfig = riskConfig.questions.find((q) => q.id === questionId);
	if (!questionConfig) {
		return 0;
	}

	let score = 0;

	if (Array.isArray(value)) {
		// Multiple choice - sum all scores
		value.forEach((option) => {
			const optionConfig = questionConfig.options.find(
				(opt) => opt.value === option,
			);
			if (optionConfig) {
				score += optionConfig.score;
			}
		});
	} else {
		// Single choice
		const optionConfig = questionConfig.options.find(
			(opt) => opt.value === value,
		);
		if (optionConfig) {
			score = optionConfig.score;
		}
	}

	return score;
}

export function validateAnswers(answers: FloodRiskAnswers): boolean {
	const answeredCount = Object.keys(answers).length;
	return answeredCount >= riskConfig.minimumAnswersRequired;
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
		floodZoneBool: (value: number | null | undefined) =>
			value && value > 0 ? "yes" : "no",
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
			answers[question.id] = {
				value: value as string | string[] | number,
				score: calculateQuestionScore(
					question.id,
					value as string | string[] | number,
				),
				weight: question.weight || 1,
			};
		}
	});

	return answers;
}

export type WorkflowStep = "address" | "interim" | "questionnaire" | "results";

export function getNextWorkflowStep(
	locationData: LocationData | null,
	answers: FloodRiskAnswers,
	currentPath: string,
): WorkflowStep {
	if (!locationData) {
		return "address";
	}

	if (currentPath.includes("wasser-check") && !currentPath.includes("#")) {
		return "interim";
	}

	if (currentPath.includes("#interimResult")) {
		const requiredQuestions = riskConfig.questions
			.filter((q) => q.type !== "auto")
			.map((q) => q.id);
		const missingAnswers = requiredQuestions.some((q) => !answers[q]);

		if (missingAnswers) {
			return "questionnaire";
		}
		return "results";
	}

	if (currentPath.includes("questionnaire")) {
		if (validateAnswers(answers)) {
			return "results";
		}
		return "questionnaire";
	}

	return "address";
}

export function getWorkflowRoute(step: WorkflowStep): string {
	switch (step) {
		case "address":
			return "/wasser-check";
		case "interim":
			return "/wasser-check#interimResult";
		case "questionnaire":
			return "/wasser-check/questionnaire";
		case "results":
			return "/wasser-check/results";
		default:
			return "/wasser-check";
	}
}
