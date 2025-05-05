import React from "react";
import { useTranslations } from "next-intl";
import { HazardLevel } from "./InterimResults";

interface RiskBlockProps {
	entity: string;
	harzardLevel: HazardLevel;
}

const hazardColorMap: Record<HazardLevel, { border: string; bg: string }> = {
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

const RiskBlock: React.FC<RiskBlockProps> = ({
	entity,
	harzardLevel,
}: RiskBlockProps) => {
	const t = useTranslations("checkResults");
	return (
		<div
			className={`Result-block ${hazardColorMap[harzardLevel].border} border-12`}
		>
			<div className="flex flex-col gap-2 p-4">
				<div className="">
					<h4 className="">{t(`${entity}.title`)}</h4>
				</div>
				<p className="">{t(`${entity}.${harzardLevel}`)}</p>
				<div className="my-4 grid grid-cols-4 gap-0">
					{Object.keys(hazardColorMap).map((level) => (
						<div key={level} className="flex w-full flex-col items-center">
							<div className="h-6 w-full text-center">
								{harzardLevel === level && <div>Ar</div>}
							</div>
							<div
								className={`h-3 w-full ${hazardColorMap[level as HazardLevel].bg}`}
							></div>
							<div className="p-2 text-center">{t(`hazardScale.${level}`)}</div>
						</div>
					))}
				</div>
				<div className="flex flex-col gap-2">
					<span className="font-bold">{t(`${entity}.waterLevelLabel`)}</span>
					<p className="">{t(`${entity}.recommendation`)}</p>
				</div>
				<div className="flex flex-col gap-2">
					<span className="font-bold">{t(`${entity}.subLabel`)}</span>
					<p className="">{t(`${entity}.recommendation`)}</p>
				</div>
			</div>
		</div>
	);
};

export default RiskBlock;
