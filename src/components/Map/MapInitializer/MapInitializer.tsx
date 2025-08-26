"use client";

import mapConfig from "@/config/config.json";
import services from "@/config/services.json";
import { useMapStore } from "@/lib/store/mapStore";
import {
	LayerElement,
	LayerElementBase,
	LayerStatus,
	MapConfig,
} from "@/types/map";
import { FC, useEffect } from "react";

const MapInitializer: FC = () => {
	const setConfig = useMapStore((state) => state.setConfig);

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

		enrichedConfig.layerConfig.baselayer.elements = enrichLayerElements(
			enrichedConfig.layerConfig.baselayer.elements,
		);

		enrichedConfig.layerConfig.subjectlayer.elements = enrichLayerElements(
			enrichedConfig.layerConfig.subjectlayer.elements,
		);

		setConfig(enrichedConfig as unknown as MapConfig);
	}, [setConfig]);

	return null;
};

export default MapInitializer;
