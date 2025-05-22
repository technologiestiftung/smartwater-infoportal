import React from "react";
import ResultBlock from "./ResultBlock";
import { useTranslations } from "next-intl";
import { Button, Panel } from "berlin-ui-library";
import { HazardLevel } from "@/lib/types";
import { useRouter } from "next/navigation";

interface InterimResultsProps {
	entities: { name: string; hazardLevel: HazardLevel }[];
}

const InterimResults: React.FC<InterimResultsProps> = ({
	entities,
}: InterimResultsProps) => {
	const t = useTranslations("floodCheck");
	const router = useRouter();

	return (
		<div className="flex w-full flex-col gap-12">
			<div className="flex flex-col gap-6">
				<h2>{t("hazardSummary.low")}</h2>
				<div className="grid gap-4 lg:grid-cols-2">
					{/* Content goes here */}
					{entities.map((entity) => (
						<ResultBlock
							key={entity.name}
							entity={entity.name}
							harzardLevel={entity.hazardLevel}
						/>
					))}
				</div>
				{
					<div>
						<div>
							<Panel variant="hint">
								<h4 className="">{t("hint.title")}</h4>
							</Panel>
						</div>
						<p className="">{t("hint.description")}</p>
					</div>
				}

				<Button
					onClick={() => {
						router.push("/wasser-check#questionnaire");
					}}
					className="w-full lg:w-fit"
				>
					{t("checkBuildingRiskButton")}
				</Button>
			</div>
			<div className="flex w-full flex-col gap-6">
				<p className="">{t("dataSourceInfo")}</p>
				<p className="">{t("eventRarityInfo")}</p>
			</div>
		</div>
	);
};

export default InterimResults;
