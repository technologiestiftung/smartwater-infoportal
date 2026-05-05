import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { HazardLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResultBlockProps {
	entity: string;
	hazardLevel: HazardLevel;
	showSubLabel?: boolean;
	subHazardLevel?: string;
}

const hazardColorMap: Record<HazardLevel, { border: string; bg: string }> = {
	none: {
		border: "border-panel-colored",
		bg: "bg-panel-colored",
	},
	low: {
		border: "border-hazard-low",
		bg: "bg-hazard-low",
	},
	moderate: {
		border: "border-hazard-moderate",
		bg: "bg-hazard-moderate",
	},
	high: {
		border: "border-hazard-high",
		bg: "bg-hazard-high",
	},
	severe: {
		border: "border-hazard-severe",
		bg: "bg-hazard-severe",
	},
};

const ResultBlock: React.FC<ResultBlockProps> = ({
	entity,
	hazardLevel,
	showSubLabel = false,
	subHazardLevel,
}: ResultBlockProps) => {
	const t = useTranslations("floodCheck");

	// Get aria label for hazard level indicator
	const getHazardAriaLabel = (level: string, isCurrent: boolean) => {
		const levelText = t(`hazardScale.${level}`);
		const status = isCurrent
			? t("buildingRiskAssessment.buildingRisk.ariaLabels.currentStatus")
			: t("buildingRiskAssessment.buildingRisk.ariaLabels.notApplicableStatus");
		return t(
			"buildingRiskAssessment.buildingRisk.ariaLabels.hazardLevelIndicator",
			{
				level: levelText,
				status: status,
			},
		);
	};

	return (
		<div
			className={cn(
				"Result-block",
				hazardLevel !== "none" ? "border-12" : "border-hatch p-[12px]",
				hazardLevel !== "none" && hazardColorMap[hazardLevel]?.border,
			)}
		>
			<div className="flex flex-col gap-2 bg-white p-4">
				<div className="flex items-center gap-2">
					<Image
						className="w-6"
						src={`/${entity === "heavyRain" ? "heavyrain" : "fluvialFlood"}.svg`}
						alt={`${entity} Icon`}
						width={24}
						height={24}
					/>
					<h4 className="">{t(`${entity}.title`)}</h4>
				</div>
				<p className="">{t(`${entity}.${hazardLevel}`)}</p>
				<div className="my-4 grid grid-cols-4 gap-0">
					{hazardLevel !== "none" && (
						<>
							{Object.keys(hazardColorMap)
								.filter((level) => level !== "none")
								.map((level) => (
									<div
										key={level}
										className="flex w-full flex-col items-center"
									>
										<div className="flex h-10 w-full items-center justify-center text-center">
											{hazardLevel === level && (
												<Image
													src="/arrow_down.svg"
													alt={t(
														"buildingRiskAssessment.buildingRisk.ariaLabels.currentHazardLevel",
														{
															level: t(`hazardScale.${level}`),
														},
													)}
													width={24}
													height={24}
												/>
											)}
										</div>
										<div
											className={`h-3 w-full ${hazardColorMap[level as HazardLevel].bg}`}
											aria-label={getHazardAriaLabel(
												level,
												hazardLevel === level,
											)}
										></div>
										<div aria-hidden className="p-2 text-center">
											{t(`hazardScale.${level}`)}
										</div>
									</div>
								))}
						</>
					)}
				</div>
				{showSubLabel && (
					<div className="flex flex-col gap-2">
						<span className="font-bold">{t(`${entity}.subLabel`)}</span>
						<p
							className={cn(
								subHazardLevel === "floodZoneIndexError" ? "text-red-600" : "",
							)}
						>
							{t(`${entity}.${subHazardLevel}`)}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ResultBlock;
