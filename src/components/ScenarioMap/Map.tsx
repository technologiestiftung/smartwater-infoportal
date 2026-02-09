"use client";

import dynamic from "next/dynamic";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";
import { Scenario } from "@/types/map";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/lib/store/mapStore";
import { useMapLoading } from "@/lib/utils/useMapLoading";

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
	const scenarioMap = useMapStore((s) => s.scenarioMap);
	const map = scenarioMap[scenario] ?? null;
	const loading = useMapLoading(map, false);

	return (
		<div
			className="relative"
			id="scenario-ready"
			data-ready={loading ? "0" : "1"}
		>
			<MapInitializer scenario={scenario} />
			<div className={cn("relative", "h-[700px] w-[1140px]")} id={mapRootId}>
				<LazyOlMap scenario={scenario}>
					<LayerInitializer scenario={scenario} />
				</LazyOlMap>
				<div className="absolute bottom-4 left-4 bg-white/45 p-1">
					<p className="text-[6px] text-[8px] italic leading-none">
						Basemap: Bundesamt für Kartographie und Geodäsie (BKG)
					</p>
				</div>
			</div>
		</div>
	);
};

export default ScenarioMap;
