import { useTranslations } from "next-intl";
import { RiskLevel, FloodRiskAnswers, RiskFactor } from "@/lib/types";
import floodRiskConfig from "@/config/floodRiskConfig.json";
import { HazardEntity } from "@/utils/storeUtils";
import { calculateRiskLevel, cn } from "@/lib/utils";

interface RiskFactorsProps {
	floodRiskAnswers: FloodRiskAnswers | null;
	hazardEntities: HazardEntity[] | null;
	isNotRiskBlock?: boolean;
}

const RiskFactors = ({
	hazardEntities,
	floodRiskAnswers,
	isNotRiskBlock = false,
}: RiskFactorsProps) => {
	const t = useTranslations("floodCheck");

	const getRiskAriaLabel = (riskLevel: RiskLevel, factorName: string) => {
		const riskLevelText = t(
			`buildingRiskAssessment.buildingRisk.riskLevels.${riskLevel}`,
		);
		return t("buildingRiskAssessment.buildingRisk.ariaLabels.riskIndicator", {
			factor: factorName,
			riskLevel: riskLevelText,
		});
	};

	const getRiskClass = (riskLevel: RiskLevel, id: string): string => {
		if (
			(id === "backflowProtection" || id === "propertyDrainage") &&
			riskLevel === "dontKnow"
		)
			return "bg-risk-high";
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

	const defaultRiskFactors: RiskFactor[] = floodRiskConfig.riskFactors
		.map((factor) => ({
			id: factor.id,
			riskLevel: calculateRiskLevel(
				factor.questionId,
				floodRiskAnswers,
				hazardEntities,
			),
			translationKey: factor.translationKey,
			hasInfo: factor.id === "floodplain",
		}))
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

	return (
		<>
			{defaultRiskFactors.map((factor) => {
				const factorName = t(factor.translationKey);
				const factorDescription = t(
					factor.translationKey.replace("title", factor.riskLevel),
				);
				return (
					<div key={factor.id} className="inline-flex gap-4">
						<div
							className={`${getRiskClass(factor.riskLevel, factor.id)} flex size-5 flex-shrink-0 items-center justify-center rounded-full`}
							role="status"
							aria-label={getRiskAriaLabel(factor.riskLevel, factorName)}
						>
							{(factor.riskLevel === "unknown" ||
								factor.riskLevel === "dontKnow") && (
								<span className="text-xs font-bold text-white">?</span>
							)}
						</div>
						<div className="flex flex-col gap-1">
							<span aria-hidden className={cn(isNotRiskBlock && "font-bold")}>
								{factorName}
							</span>
							{isNotRiskBlock && (
								<>
									<span aria-hidden>{factorDescription}</span>{" "}
									{!!factor.hasInfo && (
										<span className="italic">
											{t(factor.translationKey.replace("title", "info"))}
										</span>
									)}
								</>
							)}
						</div>
					</div>
				);
			})}
		</>
	);
};

export default RiskFactors;
