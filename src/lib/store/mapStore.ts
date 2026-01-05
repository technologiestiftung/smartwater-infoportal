import {
	createGetLayerStatus,
	createSetLayerStatus,
} from "@/lib/store/mapActions";
import { MapStoreState } from "@/types/map";
import { create } from "zustand";

export const useMapStore = create<MapStoreState>((set, get) => ({
	map: null,
	mapSR: null,
	mapHW: null,
	mapSeltenSR: null,
	config: null,
	configSR: null,
	configHW: null,
	configSeltenSR: null,
	layers: [],
	layersSR: [],
	layersHW: [],
	layersSeltenSR: [],
	currentFeature: null,
	isLayerTreeOpen: false,

	// Map
	setConfig: (config) => set({ config }),
	setConfigSR: (configSR) => set({ configSR }),
	setConfigHW: (configHW) => set({ configHW }),
	setConfigSeltenSR: (configSeltenSR) => set({ configSeltenSR }),
	populateMap: (map) => set({ map }),
	populateMapSR: (mapSR) => set({ mapSR }),
	populateMapHW: (mapHW) => set({ mapHW }),
	populateMapSeltenSR: (mapSeltenSR) => set({ mapSeltenSR }),
	removeMap: () => set({ map: null }),
	removeMapSR: () => set({ mapSR: null }),
	removeMapHW: () => set({ mapHW: null }),
	removeMapSeltenSR: () => set({ mapSeltenSR: null }),

	// LayerTree
	setIsLayerTreeOpen: (isOpen) => set({ isLayerTreeOpen: isOpen }),

	// Layers    layers: [],
	setLayers: (layers) => set({ layers }),
	setLayersSR: (layersSR) => set({ layersSR }),
	setLayersHW: (layersHW) => set({ layersHW }),
	setLayersSeltenSR: (layersSeltenSR) => set({ layersSeltenSR }),
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

	// Layer Status
	setLayerStatus: createSetLayerStatus(set, get),
	getLayerStatus: createGetLayerStatus(get),

	// Features
	setCurrentFeature: (currentFeature) => set({ currentFeature }),
}));
