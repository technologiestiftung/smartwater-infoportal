"use client";

import mapConfig from "@/config/config.json";
import services from "@/config/services.json";
import { useMapStore } from "@/lib/store/mapStore";
import {
	LayerElement,
	LayerElementBase,
	LayerStatus,
	MapConfig,
	Scenario,
	SUBJECT_LAYER_BY_SCENARIO,
} from "@/types/map";
import { FC, useEffect } from "react";

type MapInitializerProps = {
	scenario: Scenario;
};

const MapInitializer: FC<MapInitializerProps> = ({ scenario }) => {
	const setScenarioConfig = useMapStore((s) => s.setScenarioConfig);

	useEffect(() => {
		const servicesMap = new Map(
			services.map((service) => [service.id, service]),
		);

		const enrichLayerElements = (elements: LayerElementBase[]) =>
			(elements as LayerElement[]).map((layer) => ({
				...layer,
				status: "initial" as LayerStatus,
				service: servicesMap.get(layer.id),
			}));

		const enrichedConfig = structuredClone(mapConfig);

		enrichedConfig.layerConfig.baselayer.elements = enrichLayerElements([
			{ id: "basemap", visibility: true },
		]);

		// scenario-specific subject layers
		const subjectLayerIds = SUBJECT_LAYER_BY_SCENARIO[scenario] ?? [];

		enrichedConfig.layerConfig.subjectlayer.elements = enrichLayerElements(
			subjectLayerIds.map((id) => ({ id, visibility: true })),
		);

		setScenarioConfig(scenario, enrichedConfig as unknown as MapConfig);
	}, [scenario, setScenarioConfig]);

	return null;
};

export default MapInitializer;
