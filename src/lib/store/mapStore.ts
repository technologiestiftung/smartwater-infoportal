import {
	createGetLayerStatus,
	createSetLayerStatus,
} from "@/lib/store/mapActions";
import { MapStoreState } from "@/types/map";
import { create } from "zustand";

export const useMapStore = create<MapStoreState>((set, get) => ({
	scenarioConfig: {},
	setScenarioConfig: (scenario, config) =>
		set((state) => ({
			scenarioConfig: {
				...state.scenarioConfig,
				[scenario]: config,
			},
		})),
	scenarioMap: {},
	populateScenarioMap: (scenario, map) =>
		set((state) => ({
			scenarioMap: { ...state.scenarioMap, [scenario]: map },
		})),
	removeScenarioMap: (scenario) =>
		set((state) => ({
			scenarioMap: { ...state.scenarioMap, [scenario]: null },
		})),
	scenarioLayers: {},
	setScenarioLayers: (scenario, layers) =>
		set((state) => ({
			scenarioLayers: {
				...state.scenarioLayers,
				[scenario]: layers,
			},
		})),

	config: null,
	map: null,
	layers: [],

	// Map
	setConfig: (config) => set({ config }),
	populateMap: (map) => set({ map }),
	removeMap: () => set({ map: null }),

	// Layers    layers: [],
	setLayers: (layers) => set({ layers }),

	addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
	removeLayer: (layerId) =>
		set((state) => ({
			layers: state.layers.filter((l) => l.id !== layerId),
		})),
	updateLayer: (layerId, updates) =>
		set((state) => ({
			layers: state.layers.map((l) =>
				l.id === layerId ? { ...l, ...updates } : l,
			),
		})),

	setLayerVisibility: (layerId, visible) => {
		const layerToUpdate = get().layers.find((l) => l.id === layerId);

		if (layerToUpdate) {
			layerToUpdate.olLayer.setVisible(visible);
			get().updateLayer(layerId, { visibility: visible });
		}
	},
	setLayerOrder: (orderedIds) => {
		const currentLayers = get().layers;
		const sortedLayers = [...currentLayers].sort(
			(a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id),
		);

		const updatedLayers = sortedLayers.map((layer, index) => {
			const newZIndex = 100 + index;
			layer.olLayer.setZIndex(newZIndex);
			return { ...layer, zIndex: newZIndex };
		});

		set({ layers: updatedLayers });
	},
}));
