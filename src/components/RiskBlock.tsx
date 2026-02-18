import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { RiskLevel, FloodRiskAnswers, FloodRiskResult } from "@/lib/types";
import floodRiskConfig from "@/config/floodRiskConfig.json";
import useStore from "@/store/defaultStore";
import { cn } from "@/lib/utils";
import { HazardEntity } from "@/utils/storeUtils";

interface RiskFactor {
	id: string;
	riskLevel: RiskLevel;
	translationKey: string;
}

interface RiskBlockProps {
	floodRiskResultDown?: FloodRiskResult | null;
	floodRiskAnswersDown?: FloodRiskAnswers | null;
	hazardEntitiesDown?: HazardEntity[] | null;
}

const RiskBlock = ({
	floodRiskResultDown,
	floodRiskAnswersDown,
	hazardEntitiesDown,
}: RiskBlockProps) => {
	const t = useTranslations("floodCheck");
	const storeFloodRiskResult = useStore((state) => state.floodRiskResult);
	const storeFloodRiskAnswers = useStore((state) => state.floodRiskAnswers);
	const floodRiskResult = floodRiskResultDown ?? storeFloodRiskResult;
	const floodRiskAnswers = floodRiskAnswersDown ?? storeFloodRiskAnswers;

	const getHazardEntities = useStore((state) => state.getHazardEntities);
	const hazardEntities = hazardEntitiesDown ?? getHazardEntities();
	const isDev = false; //process.env.NODE_ENV === "development";
	const showTestingFeatures = useStore((state) => state.showTestingFeatures);
	const testing = isDev && showTestingFeatures.includes("riskWidgetDetails");
	const { min, max } = floodRiskConfig.evaluation;
	const value = floodRiskResult?.evaluation ?? 0;
	const arrowPosition = ((value - min) / (max - min)) * 100;

	// Get aria label for risk level using i18n
	const getRiskAriaLabel = (riskLevel: RiskLevel, factorName: string) => {
		const riskLevelText = t(
			`buildingRiskAssessment.buildingRisk.riskLevels.${riskLevel}`,
		);
		return t("buildingRiskAssessment.buildingRisk.ariaLabels.riskIndicator", {
			factor: factorName,
			riskLevel: riskLevelText,
		});
	};
	// Get risk class for styling
	const getRiskClass = (riskLevel: RiskLevel) => {
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
	// Simple risk level calculation based on individual answer scores
	const calculateRiskLevel = (questionId: string): RiskLevel => {
		if (!floodRiskAnswers || !floodRiskAnswers[questionId]) {
			return "unknown";
		}

		const answer = floodRiskAnswers[questionId];
		const score = answer.score || 0;
		if (questionId === "qA") {
			const fluvialFloodEntity = hazardEntities?.find(
				(entity) => entity.name === "fluvialFlood",
			)?.subHazardLevel;
			if (fluvialFloodEntity === "yes") {
				return "high";
			}
			return "low";
		}
		if (answer?.value === "noInformation") {
			return "dontKnow";
		}
		if (questionId === "qB" && answer?.value === 0) {
			return "low";
		}
		if (questionId === "q2") {
			if (answer?.value === "highValue") {
				return "high";
			} else if (answer?.value === "lowValue") {
				return "moderate";
			}
		}
		if (score >= 2) {
			return "low";
		}
		if (score >= 0) {
			return "moderate";
		}
		return "high";
	};

	const getBorder = () => {
		if (floodRiskResult?.riskLevel === "high") {
			return "border-risk-high";
		} else if (floodRiskResult?.riskLevel === "moderate") {
			return "border-risk-moderate";
		} else if (floodRiskResult?.riskLevel === "low") {
			return "border-risk-low";
		}
		return "border-risk";
	};

	const defaultRiskFactors: RiskFactor[] = floodRiskConfig.riskFactors
		.map((factor) => ({
			id: factor.id,
			riskLevel: calculateRiskLevel(factor.questionId),
			translationKey: factor.translationKey,
		}))
		.filter((factor) => {
			const isThereABasement = !floodRiskAnswers["q1"]?.value
				.toString()
				.startsWith("no");
			if (factor.id === "basementUsage" && !isThereABasement) {
				return false;
			}
			return true;
		});

	return (
		<div
			className={cn("Risk-block border-12 overflow-hidden", getBorder())}
			id="risk-block"
		>
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
				{floodRiskResult?.riskLevel && (
					<p className="">
						{t(
							`buildingRiskAssessment.buildingRisk.level${
								floodRiskResult?.riskLevel.charAt(0).toUpperCase() +
								floodRiskResult?.riskLevel.slice(1)
							}`,
						)}
					</p>
				)}
				{testing && (
					<div className="border-1 border-black p-4">
						<p className="">Berechnungswerte:</p>
						<p className="">
							SUMME-Punkte: <strong>{floodRiskResult?.totalScore}</strong>
						</p>
						<p className="">
							X: <strong>{floodRiskResult?.counter}</strong>
						</p>
						<p className="">
							Bewertung Gefährdung <br /> (SUMME-Punkte/X):{" "}
							<strong>{floodRiskResult?.evaluation}</strong>
						</p>
						<p className="">
							Risiko Level: <strong>{floodRiskResult?.riskLevel}</strong>
						</p>
					</div>
				)}
				<div className="my-4 flex flex-col gap-2">
					<div className="relative flex h-6 w-full">
						<div
							className="absolute inset-0 flex"
							style={{ transform: `translateX(${arrowPosition}%)` }}
						>
							<Image
								src="/arrow_down.svg"
								alt={t(
									"buildingRiskAssessment.buildingRisk.ariaLabels.currentHazardLevel",
									{
										level: t(
											`buildingRiskAssessment.buildingRisk.riskLevels.${floodRiskResult?.riskLevel}`,
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
									{(factor.riskLevel === "unknown" ||
										factor.riskLevel === "dontKnow") && (
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
