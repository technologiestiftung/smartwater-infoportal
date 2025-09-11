/* eslint-disable */
"use client";

import { useMapStore } from "@/lib/store/mapStore";
import { LayerElement, LayerService, ManagedLayer } from "@/types/map";
import { applyStyle } from "ol-mapbox-style";
import { Layer } from "ol/layer";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorTileLayer from "ol/layer/VectorTile";
import ImageWMS from "ol/source/ImageWMS";
import TileWMS from "ol/source/TileWMS";
import { useCallback, useEffect } from "react";

interface LayerCreationResult {
	layer: Layer | null;
	status: ManagedLayer["status"];
	error?: string;
}

const LayerInitializer = () => {
	const config = useMapStore((state) => state.configHW);
	const map = useMapStore((state) => state.mapHW);
	const setLayersInStore = useMapStore((state) => state.setLayersHW);

	const createWMSLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			try {
				const params = {
					LAYERS: serviceConfig.layers!,
					FORMAT: serviceConfig.format || "image/png",
					TRANSPARENT: serviceConfig.transparent ?? true,
					VERSION: serviceConfig.version || "1.3.0",
				};

				if (serviceConfig.singleTile) {
					const imageSource = new ImageWMS({
						url: serviceConfig.url,
						params,
						serverType: "geoserver",
						attributions: serviceConfig.layerAttribution,
						crossOrigin: "anonymous",
					});

					return {
						layer: new ImageLayer({ source: imageSource }),
						status: "loaded",
					};
				}

				const tileSource = new TileWMS({
					url: serviceConfig.url,
					params,
					serverType: "geoserver",
					attributions: serviceConfig.layerAttribution,
					crossOrigin: "anonymous",
				});

				return {
					layer: new TileLayer({ source: tileSource }),
					status: "loaded",
				};
			} catch (error) {
				console.error("[LayerInitializer @ createWMSLayer]", serviceConfig);
				return {
					layer: null,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown WMS error",
				};
			}
		},
		[],
	);

	const createVectorTileLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			try {
				if (!serviceConfig.vtStyles || serviceConfig.vtStyles.length === 0) {
					return {
						layer: null,
						status: "error",
						error: "No vector tile styles configured",
					};
				}

				const layer = new VectorTileLayer({ declutter: true });

				if (serviceConfig.vtStyles.length > 0) {
					serviceConfig.vtStyles.forEach((style) => {
						applyStyle(layer, style.url);
					});
				}

				return {
					layer,
					status: "loaded",
				};
			} catch (error) {
				return {
					layer: null,
					status: "error",
					error:
						error instanceof Error ? error.message : "Unknown VectorTile error",
				};
			}
		},
		[],
	);

	// Create a single layer based on service configuration
	const createLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			switch (serviceConfig.typ) {
				case "WMS":
					return createWMSLayer(serviceConfig);
				case "VectorTile":
					return createVectorTileLayer(serviceConfig);
				default:
					return {
						layer: null,
						status: "error",
						error: `Unknown layer type: ${serviceConfig.typ}`,
					};
			}
		},
		[createWMSLayer, createVectorTileLayer],
	);

	// Process a group of layers (base or subject)
	const processLayerGroup = useCallback(
		(
			layerElements: LayerElement[],
			layerType: "base" | "subject",
		): ManagedLayer[] => {
			const managedLayers: ManagedLayer[] = [];

			layerElements.forEach((layerConfig, index) => {
				const { service: serviceConfig } = layerConfig;

				if (!serviceConfig) {
					console.warn(
						`[LayerInitializer] Layer ${layerConfig.id} has no service config. Skipping.`,
					);
					return;
				}

				const { layer: olLayer, status, error } = createLayer(serviceConfig);

				if (olLayer) {
					const zIndex = (layerType === "base" ? 0 : 100) + index;
					olLayer.setZIndex(zIndex);
					olLayer.setVisible(layerConfig.visibility);
					olLayer.setOpacity(1);
					olLayer.set("id", layerConfig.id);

					const managedLayer: ManagedLayer = {
						id: layerConfig.id,
						config: layerConfig,
						olLayer: olLayer,
						status: status,
						visibility: layerConfig.visibility,
						map_group: layerConfig.service.map_group,
						opacity: 1,
						zIndex: zIndex,
						layerType: layerType,
						error: error,
					};

					managedLayers.push(managedLayer);
					map?.addLayer(olLayer);
				} else {
					console.error(
						`[LayerInitializer] Failed to create layer ${layerConfig.id}:`,
						error,
					);
				}
			});

			return managedLayers;
		},
		[createLayer, map],
	);

	// Main effect to initialize all layers
	useEffect(() => {
		if (!config || !map) return;

		const allManagedLayers: ManagedLayer[] = [];

		// Process base layers
		const baseLayers = processLayerGroup(
			config.layerConfig.baselayer.elements,
			"base",
		);
		allManagedLayers.push(...baseLayers);

		// Process subject layers
		const subjectLayers = processLayerGroup(
			config.layerConfig.subjectlayer.elements,
			"subject",
		);
		allManagedLayers.push(
			...subjectLayers.filter(
				(subjectLayer) =>
					subjectLayer.id === "sw_infoportal:hw_gefaehrdung_clip_",
			),
		);

		// Update store with all managed layers
		setLayersInStore(allManagedLayers);

		return () => {
			allManagedLayers.forEach((layer) => {
				map.removeLayer(layer.olLayer);
			});
			setLayersInStore([]);
		};
	}, [config, map, processLayerGroup, setLayersInStore]);

	return null;
};

export default LayerInitializer;
