import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { RiskLevel, FloodRiskAnswers } from "@/lib/types";
import floodRiskConfig from "@/config/floodRiskConfig.json";

export interface RiskFactor {
	id: string;
	riskLevel: RiskLevel | "unknown";
	translationKey: string;
}

interface RiskBlockProps {
	overallRiskLevel?: RiskLevel;
	arrowPosition?: number;
	riskFactors?: RiskFactor[];
	floodRiskAnswers?: FloodRiskAnswers;
}

const RiskBlock: React.FC<RiskBlockProps> = ({
	overallRiskLevel = "moderate",
	arrowPosition = 50,
	riskFactors = [],
	floodRiskAnswers,
}) => {
	const t = useTranslations("floodCheck");

	// Get risk class for styling
	const getRiskClass = (riskLevel: RiskLevel | "unknown") => {
		switch (riskLevel) {
			case "low":
				return "bg-risk-low";
			case "moderate":
				return "bg-risk-moderate";
			case "high":
				return "bg-risk-high";
			default:
				return "bg-gray-400";
		}
	};

	// Get aria label for risk level using i18n
	const getRiskAriaLabel = (
		riskLevel: RiskLevel | "unknown",
		factorName: string,
	) => {
		const riskLevelText = t(
			`buildingRiskAssessment.buildingRisk.riskLevels.${riskLevel}`,
		);
		return t("buildingRiskAssessment.buildingRisk.ariaLabels.riskIndicator", {
			factor: factorName,
			riskLevel: riskLevelText,
		});
	};

	// Simple risk level calculation based on individual answer scores
	const calculateRiskLevel = (questionId: string): RiskLevel | "unknown" => {
		if (!floodRiskAnswers || !floodRiskAnswers[questionId]) {
			return "unknown";
		}

		const answer = floodRiskAnswers[questionId];
		const score = answer.score || 0;

		// Simple score-based risk levels: positive = low risk (green), negative = high risk (red)
		if (score >= 2) {
			return "low"; // Green
		}
		if (score >= 0) {
			return "moderate"; // Yellow
		}
		return "high"; // Red
	};

	const defaultRiskFactors: RiskFactor[] =
		riskFactors.length > 0
			? riskFactors
			: floodRiskConfig.riskFactors.map((factor) => ({
					id: factor.id,
					riskLevel: calculateRiskLevel(factor.questionId),
					translationKey: factor.translationKey,
				}));

	return (
		<div className={`Risk-block border-12 border-risk`}>
			<div className="flex flex-col gap-2 p-4">
				<div className="flex items-center gap-2">
					<Image
						className="w-6"
						src="/risk_icon.svg"
						alt="Risk Icon"
						width={24}
						height={24}
					/>
					<h4 className="">{t(`buildingRiskAssessment.buildingRisk.title`)}</h4>
				</div>
				<p className="">
					{t(
						`buildingRiskAssessment.buildingRisk.level${
							overallRiskLevel.charAt(0).toUpperCase() +
							overallRiskLevel.slice(1)
						}`,
					)}
				</p>
				<div className="my-4 flex flex-col gap-2">
					<div className="relative flex h-6 w-full">
						<div
							className="absolute inset-0 flex"
							style={{ transform: `translateX(${arrowPosition}%)` }}
						>
							<Image
								className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
								src="/arrow_down.svg"
								alt={t(
									"buildingRiskAssessment.buildingRisk.ariaLabels.currentHazardLevel",
									{
										level: t(
											`buildingRiskAssessment.buildingRisk.riskLevels.${overallRiskLevel}`,
										),
									},
								)}
								width={24}
								height={24}
							/>
						</div>
					</div>
					<Image
						className="w-full max-w-none"
						src="/Farbskala.jpg"
						alt="Farbskala"
						width={24}
						height={24}
					/>
				</div>
				<div className="flex flex-col gap-2">
					{defaultRiskFactors.map((factor) => {
						const factorName = t(factor.translationKey);
						return (
							<div key={factor.id} className="inline-flex items-center gap-4">
								<div
									className={`${getRiskClass(factor.riskLevel)} flex size-5 items-center justify-center rounded-full`}
									role="status"
									aria-label={getRiskAriaLabel(factor.riskLevel, factorName)}
								>
									{factor.riskLevel === "unknown" && (
										<span className="text-xs font-bold text-white">?</span>
									)}
								</div>
								<span aria-hidden>{factorName}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default RiskBlock;
