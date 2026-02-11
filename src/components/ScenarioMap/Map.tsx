/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable consistent-return */
"use client";

import dynamic from "next/dynamic";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";
import { Scenario } from "@/types/map";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/lib/store/mapStore";
import { getScenarioDomId } from "@/lib/utils/mapUtils";
import { useEffect } from "react";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Karte wird geladen …</div>,
});

type ScenarioMapProps = {
	scenario: Scenario;
};

const ScenarioMap = ({ scenario }: ScenarioMapProps) => {
	const mapRootId = getScenarioDomId(scenario);
	const scenarioMap = useMapStore((s) => s.scenarioMap);
	const map = scenarioMap[scenario] ?? null;

	useEffect(() => {
		(window as any).__SCREENSHOT_READY__ = false;
	}, [scenario]);
	useEffect(() => {
		if (!map) {
			return;
		}

		const markReady = () => {
			(window as any).__SCREENSHOT_READY__ = true;
		};

		map.once("rendercomplete", markReady);

		return () => {
			map.un("rendercomplete", markReady);
		};
	}, [map]);

	return (
		<div className="relative">
			<MapInitializer scenario={scenario} />
			<div className={cn("relative", "h-[700px] w-[1140px]")} id={mapRootId}>
				<LazyOlMap scenario={scenario}>
					<LayerInitializer scenario={scenario} />
				</LazyOlMap>
				<div className="absolute bottom-4 left-4 bg-white/45 p-1">
					<p className="text-[6px] text-[8px] leading-none italic">
						Basemap: Bundesamt für Kartographie und Geodäsie (BKG)
					</p>
				</div>
			</div>
		</div>
	);
};

export default ScenarioMap;
