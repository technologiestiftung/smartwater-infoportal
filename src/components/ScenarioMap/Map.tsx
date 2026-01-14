"use client";

import dynamic from "next/dynamic";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";
import { Scenario } from "@/types/map";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Karte wird geladen …</div>,
});

type ScenarioMapProps = {
	scenario: Scenario;
};

const getScenarioDomId = (scenario: Scenario) =>
	`map-root-${scenario.toLowerCase().replace(/_/g, "-")}`;

const ScenarioMap = ({ scenario }: ScenarioMapProps) => {
	const mapRootId = getScenarioDomId(scenario);

	return (
		<div className="relative">
			<MapInitializer scenario={scenario} />
			<div className="relative h-[700px] w-[1140px]" id={mapRootId}>
				<LazyOlMap scenario={scenario}>
					<LayerInitializer scenario={scenario} />
				</LazyOlMap>
			</div>
		</div>
	);
};

export default ScenarioMap;
