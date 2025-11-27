import React from "react";
import useStore from "@/store/defaultStore";
import { useTranslations } from "next-intl";
import ResultBlock from "../ResultBlock";

const PDFContent = () => {
	const t = useTranslations();
	const getHazardEntities = useStore((state) => state.getHazardEntities);
	const showTestingFeatures = useStore((state) => state.showTestingFeatures);
	const testing = showTestingFeatures.includes("showWidgetsInPDF");
	const hazardEntities = getHazardEntities();

	const heavyRain = hazardEntities?.filter(
		(entity) => entity.name === "heavyRain",
	);
	const fluvialFlood = hazardEntities?.filter(
		(entity) => entity.name === "fluvialFlood",
	);

	return (
		<div className={testing ? "" : "absolute -left-[9999px]"}>
			<div id="heavyRainWidget" className="w-fit">
				{heavyRain && heavyRain.length > 0 ? (
					<div className="w-[400px]">
						{heavyRain.map((entity) => (
							<ResultBlock
								key={entity.name}
								entity={entity.name}
								hazardLevel={entity.hazardLevel}
								showSubLabel={entity.showSubLabel || false}
								subHazardLevel={entity.subHazardLevel}
							/>
						))}
					</div>
				) : (
					<p>{t("floodCheck.noHazardData")}</p>
				)}
			</div>

			<div id="fluvialFloodWidget" className="w-fit">
				{fluvialFlood && fluvialFlood.length > 0 ? (
					<div className="w-[400px]">
						{fluvialFlood.map((entity) => (
							<ResultBlock
								key={entity.name}
								entity={entity.name}
								hazardLevel={entity.hazardLevel}
								showSubLabel={entity.showSubLabel || false}
								subHazardLevel={entity.subHazardLevel}
							/>
						))}
					</div>
				) : (
					<p>{t("floodCheck.noHazardData")}</p>
				)}
			</div>
		</div>
	);
};

export default PDFContent;
