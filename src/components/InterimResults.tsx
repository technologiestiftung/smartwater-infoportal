import React from "react";
import ResultBlock from "./ResultBlock";
import { useTranslations } from "next-intl";
import { Button, Panel } from "berlin-ui-library";
import { HazardLevel } from "@/lib/types";
import { useRouter } from "next/navigation";
import useStore from "@/store/defaultStore";
import { mapScaleToHazardLevel } from "@/lib/utils";

const InterimResults: React.FC = () => {
	const t = useTranslations("floodCheck");
	const router = useRouter();
	const hazardData = useStore((state) => state.hazardData);

	const getHazardEntities = () => {
		if (!hazardData || !hazardData.found) {
			return [
				{ name: "heavyRain", hazardLevel: "none" as HazardLevel },
				{ name: "fluvialFlood", hazardLevel: "none" as HazardLevel },
			];
		}

		return [
			{
				name: "heavyRain",
				hazardLevel: mapScaleToHazardLevel(hazardData.starkregenGefährdung),
			},
			{
				name: "fluvialFlood",
				hazardLevel: mapScaleToHazardLevel(hazardData.hochwasserGefährdung),
			},
		];
	};

	const hazardEntities = getHazardEntities();
	const maxHazardLevel = Math.max(
		hazardData?.starkregenGefährdung || 0,
		hazardData?.hochwasserGefährdung || 0,
	);
	const overallHazardLevel = mapScaleToHazardLevel(maxHazardLevel);

	return (
		<div className="flex w-full flex-col gap-12">
			<div className="flex flex-col gap-6">
				<h2>{t(`hazardSummary.${overallHazardLevel}`)}</h2>
				<div className="grid gap-4 lg:grid-cols-2">
					{hazardEntities.map((entity) => (
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
