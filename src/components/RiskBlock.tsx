import { useTranslations } from "next-intl";
import Image from "next/image";
import { FloodRiskAnswers, FloodRiskResult } from "@/lib/types";
import floodRiskConfig from "@/config/floodRiskConfig.json";
import useStore from "@/store/defaultStore";
import { cn } from "@/lib/utils";
import { HazardEntity } from "@/utils/storeUtils";
import RiskFactors from "./RiskFactors";

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
	const { min, max } = floodRiskConfig.evaluation;
	const value = floodRiskResult?.evaluation ?? 0;
	const arrowPosition = (1 - (value - min) / (max - min)) * 100;

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

	return (
		<div
			className={cn("Risk-block overflow-hidden border-12", getBorder())}
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
				{isDev && (
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
						className="w-full max-w-none rotate-180"
						src="/Farbskala.jpg"
						alt="Farbskala"
						width={24}
						height={24}
					/>
				</div>
				{(!!floodRiskAnswersDown || isDev) && (
					<RiskFactors
						hazardEntities={hazardEntities}
						floodRiskAnswers={floodRiskAnswers}
					/>
				)}
			</div>
		</div>
	);
};

export default RiskBlock;
