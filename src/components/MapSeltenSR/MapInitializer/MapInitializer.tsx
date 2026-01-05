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
	const setConfig = useMapStore((state) => state.setConfigSeltenSR);

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
			{
				id: "basemap",
				visibility: true,
			},
		]);

		enrichedConfig.layerConfig.subjectlayer.elements = enrichLayerElements([
			{ id: "ua_srgk:ca_wasserstand_selten", visibility: true },
		]);

		setConfig(enrichedConfig as unknown as MapConfig);
	}, [setConfig]);

	return null;
};

export default MapInitializer;
