import React from "react";
import ResultBlock from "./ResultBlock";
import { useTranslations } from "next-intl";
import { Button } from "berlin-ui-library";
import Link from "next/link";

export type HazardLevel = "low" | "moderate" | "high" | "severe";

interface InterimResultsProps {
	harzardLevel: HazardLevel;
	subtitle: string;
	showHint?: boolean;
}

const InterimResults: React.FC<InterimResultsProps> = ({
	harzardLevel,
	subtitle,
	showHint = true,
}: InterimResultsProps) => {
	const t = useTranslations("checkResults");
	return (
		<div className="flex flex-col gap-6">
			<h2>{t("hazardSummary.low")}</h2>
			<div className="flex flex-col gap-4">
				{/* Content goes here */}
				<ResultBlock entity="fluvialFlood" harzardLevel="low" />
				<ResultBlock entity="heavyRain" harzardLevel="moderate" />
			</div>
			{showHint && (
				<>
					<h4 className="">{t("hint.title")}</h4>
					<p className="">{t("hint.description")}</p>
				</>
			)}
			<Link href="/wasser-check">
				<Button>{t("checkBuildingRiskButton")}</Button>
			</Link>
		</div>
	);
};

export default InterimResults;
