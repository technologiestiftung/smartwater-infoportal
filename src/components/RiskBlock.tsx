import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { RiskLevel } from "@/lib/types";

export interface RiskFactor {
	id: string;
	riskLevel: RiskLevel;
	translationKey: string;
}

interface RiskBlockProps {
	overallRiskLevel?: RiskLevel;
	arrowPosition?: number;
	riskFactors?: RiskFactor[];
}

const RiskBlock: React.FC<RiskBlockProps> = ({
	overallRiskLevel = "moderate",
	arrowPosition = 50,
	riskFactors = [],
}) => {
	const t = useTranslations("floodCheck");

	const defaultRiskFactors: RiskFactor[] =
		riskFactors.length > 0
			? riskFactors
			: [
					{
						id: "basement",
						riskLevel: "low",
						translationKey:
							"floodCheckfloodCheck.buildingRisk.factors.basement",
					},
					{
						id: "basementWindow",
						riskLevel: "moderate",
						translationKey:
							"floodCheckfloodCheck.buildingRisk.factors.basementWindow",
					},
					{
						id: "backflowProtection",
						riskLevel: "high",
						translationKey:
							"floodCheckfloodCheck.buildingRisk.factors.backflowProtection",
					},
					{
						id: "socketInstallation",
						riskLevel: "moderate",
						translationKey:
							"floodCheckfloodCheck.buildingRisk.factors.socketInstallation",
					},
					{
						id: "geographicalLocation",
						riskLevel: "low",
						translationKey:
							"floodCheckfloodCheck.buildingRisk.factors.geographicalLocation",
					},
				];

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
					<h4 className="">{t(`floodCheckfloodCheck.buildingRisk.title`)}</h4>
				</div>
				<p className="">
					{t(
						`floodCheckfloodCheck.buildingRisk.level${
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
								alt="Arrow Down"
								width={24}
								height={24}
							/>
						</div>
					</div>
					{/* <div className="bg-linear-to-r to-risk-high from-risk-low via-risk-moderate h-12 w-full"></div> */}
					<Image
						className="w-full max-w-none"
						src="/Farbskala.jpg"
						alt="Farbskala"
						width={24}
						height={24}
					/>
				</div>
				<div className="flex flex-col gap-2">
					{defaultRiskFactors.map((factor) => (
						<div key={factor.id} className="inline-flex items-center gap-4">
							<div
								className={`bg-risk-${factor.riskLevel} size-5 rounded-full`}
							/>
							<span className="">{t(factor.translationKey)}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default RiskBlock;
