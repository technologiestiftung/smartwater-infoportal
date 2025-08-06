import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { HazardLevel } from "@/lib/types";

interface ResultBlockProps {
	entity: string;
	harzardLevel: HazardLevel;
}

const hazardColorMap: Record<HazardLevel, { border: string; bg: string }> = {
	none: {
		border: "border-hazard-none",
		bg: "bg-hazard-none",
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
	harzardLevel,
}: ResultBlockProps) => {
	const t = useTranslations("floodCheck");
	return (
		<div
			className={`Result-block ${hazardColorMap[harzardLevel].border} border-12`}
		>
			<div className="flex flex-col gap-2 p-4">
				<div className="">
					<h4 className="">{t(`${entity}.title`)}</h4>
				</div>
				<p className="">{t(`${entity}.${harzardLevel}`)}</p>
				<div className="my-4 grid grid-cols-5 gap-0">
					{Object.keys(hazardColorMap).map((level) => (
						<div key={level} className="flex w-full flex-col items-center">
							<div className="flex h-10 w-full items-center justify-center text-center">
								{harzardLevel === level && (
									<Image
										src="/arrow_down.svg"
										alt="Arrow Down"
										width={24}
										height={24}
									/>
								)}
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

export default ResultBlock;
