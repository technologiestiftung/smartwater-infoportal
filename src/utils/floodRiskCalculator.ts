import { FloodRiskAnswers, FloodRiskResult } from "../store/defaultStore";

export interface RiskMessages {
	insufficientData: string;
	riskLevels: {
		low: string;
		moderate: string;
		high: string;
	};
}

const SCORING_WEIGHTS = {
	q1: 2,
	q2: 3,
	q3: 5,
	q4: 4,
	q5: 4,
	q6: 5,
	qA: 3,
	qB: 3,
	qC: 3,
};

const SCORING_VALUES = {
	q1: {
		yesWithWindow: -2,
		yesWithoutWindow: -1,
		no: 2,
		noInformation: 0,
	},
	q2: {
		living: -3,
		utility: -2,
		storageLowValue: -1,
		storageHighValue: -2,
		none: 1,
		noInformation: 0,
	},
	q3: {
		one: -1,
		two: -2,
		threeOrMore: -3,
		no: 2,
		noInformation: 0,
	},
	q4: {
		yesGood: 3,
		yesUnknown: 1,
		no: -1,
		noInformation: 0,
	},
	q5: {
		good: 3,
		bad: -2,
		unknown: -1,
		noInformation: 0,
	},
	q6: {
		one: 2,
		twoOrMore: 3,
		no: -1,
		noInformation: 0,
	},
	qA: {
		yes: -2,
		no: 2,
	},
	qB: {
		1: 1,
		2: 0,
		3: -1,
		4: -2,
	},
	qC: {
		1: 1,
		2: 0,
		3: -1,
		4: -2,
	},
};

export function calculateFloodRiskScore(
	answers: FloodRiskAnswers,
	messages: RiskMessages,
): FloodRiskResult {
	let totalScore = 0;
	let noInformationCount = 0;

	// Count "no information" answers for questions 1-6
	const mainQuestions = ["q1", "q2", "q3", "q4", "q5", "q6"];
	for (const questionId of mainQuestions) {
		const answer = answers[questionId as keyof FloodRiskAnswers];
		if (
			answer === "noInformation" ||
			(Array.isArray(answer) && answer.includes("noInformation"))
		) {
			noInformationCount++;
		}
	}

	// Check if more than 4 out of 6 questions answered with "no information"
	if (noInformationCount > 4) {
		return {
			score: 0,
			riskLevel: "insufficient-data",
			message: messages.insufficientData,
		};
	}

	// Calculate weighted score for each question
	Object.entries(answers).forEach(([questionId, answer]) => {
		const weight = SCORING_WEIGHTS[questionId as keyof typeof SCORING_WEIGHTS];
		if (!weight || !answer) {
			return;
		}

		let questionScore = 0;

		if (questionId === "q2" && Array.isArray(answer)) {
			// Q2 is multiple choice, sum all selected values
			answer.forEach((option) => {
				const optionScore =
					SCORING_VALUES.q2[option as keyof typeof SCORING_VALUES.q2];
				if (optionScore !== undefined) {
					questionScore += optionScore;
				}
			});
		} else if (questionId === "qB" || questionId === "qC") {
			// qB and qC are numeric values (1-4)
			const numericAnswer = Number(answer);
			questionScore =
				SCORING_VALUES[questionId as "qB" | "qC"][
					numericAnswer as 1 | 2 | 3 | 4
				] || 0;
		} else {
			// Single choice questions
			const scoringTable =
				SCORING_VALUES[questionId as keyof typeof SCORING_VALUES];
			if (scoringTable && typeof scoringTable === "object") {
				questionScore =
					(scoringTable as Record<string, number>)[answer as string] || 0;
			}
		}

		totalScore += questionScore * weight;
	});

	// Use total score directly (not weighted average)
	const finalScore = totalScore;

	// Determine risk level based on score ranges
	let riskLevel: FloodRiskResult["riskLevel"];
	let message: string;

	// Risk levels based on total score ranges from the table
	if (finalScore >= 28) {
		riskLevel = "low";
		message = messages.riskLevels.low;
	} else if (finalScore >= 19) {
		riskLevel = "moderate";
		message = messages.riskLevels.moderate;
	} else if (finalScore > -28) {
		riskLevel = "high";
		message = messages.riskLevels.high;
	} else {
		riskLevel = "insufficient-data";
		message = messages.insufficientData;
	}

	return {
		score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
		riskLevel,
		message,
	};
}

export function validateAnswers(answers: FloodRiskAnswers): boolean {
	const mainQuestions = ["q1", "q2", "q3", "q4", "q5", "q6"];
	let answeredCount = 0;

	for (const questionId of mainQuestions) {
		const answer = answers[questionId as keyof FloodRiskAnswers];
		if (answer && answer !== "noInformation") {
			answeredCount++;
		}
	}

	return answeredCount >= 2; // At least 2 out of 6 questions must be answered
}
