import React from "react";
import ResultBlock from "./ResultBlock";
import { useTranslations } from "next-intl";
import { Button } from "berlin-ui-library";
import Link from "next/link";

export type HazardLevel = "low" | "moderate" | "high" | "severe";

interface InterimResultsProps {
	entities: { name: string; hazardLevel: HazardLevel }[];
}

const InterimResults: React.FC<InterimResultsProps> = ({
	entities,
}: InterimResultsProps) => {
	const t = useTranslations("floodCheck");

	// Check if all hazard levels are "low"
	const showHint =
		entities.length > 0 &&
		entities.every((entity) => entity.hazardLevel === "low");

	return (
		<div className="flex w-full flex-col gap-12">
			<div className="flex flex-col gap-6">
				<h2>{t("hazardSummary.low")}</h2>
				<div className="grid gap-4 md:grid-cols-2">
					{/* Content goes here */}
					{entities.map((entity) => (
						<ResultBlock
							key={entity.name}
							entity={entity.name}
							harzardLevel={entity.hazardLevel}
						/>
					))}
				</div>
				{showHint && (
					<>
						<h4 className="">{t("hint.title")}</h4>
						<p className="">{t("hint.description")}</p>
					</>
				)}
				<Link href="/wasser-check#analysis">
					<Button>{t("checkBuildingRiskButton")}</Button>
				</Link>
			</div>
			<div className="flex w-full flex-col gap-6">
				<p className="">{t("dataSourceInfo")}</p>
				<p className="">{t("eventRarityInfo")}</p>
			</div>
		</div>
	);
};

export default InterimResults;
