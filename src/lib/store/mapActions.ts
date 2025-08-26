/* eslint-disable */
import {
	LayerElement,
	LayerStatus,
	MapConfig,
	MapStoreState,
} from "@/types/map";

function findAndUpdateLayerById(
	config: MapConfig,
	id: string,
	update: (layer: LayerElement) => LayerElement,
): MapConfig {
	const updateElements = (elements: LayerElement[]) =>
		elements.map((el) => (el.id === id ? update(el) : el));

	return {
		...config,
		layerConfig: {
			...config.layerConfig,
			baselayer: {
				...config.layerConfig.baselayer,
				elements: updateElements(config.layerConfig.baselayer.elements),
			},
			subjectlayer: {
				...config.layerConfig.subjectlayer,
				elements: updateElements(config.layerConfig.subjectlayer.elements),
			},
		},
	};
}

export const createSetLayerStatus =
	(
		set: (fn: (state: MapStoreState) => Partial<MapStoreState>) => void,
		get: () => MapStoreState,
	) =>
	(id: string, status: LayerStatus) => {
		const config = get().config;
		if (!config) return;

		const updatedConfig = findAndUpdateLayerById(config, id, (layer) => ({
			...layer,
			status,
		}));

		set(() => ({ config: updatedConfig }));
	};

export const createGetLayerStatus =
	(get: () => MapStoreState) =>
	(id: string): LayerStatus | undefined => {
		const config = get().config;
		if (!config) return;

		const allLayers = [
			...config.layerConfig.baselayer.elements,
			...config.layerConfig.subjectlayer.elements,
		];

		return allLayers.find((el) => el.id === id)?.status;
	};
