/* eslint-disable */
"use client";

import { useMapStore } from "@/lib/store/mapStore";
import { getEpsgFromCrs } from "@/lib/utils/mapUtils";
import { LayerElement, LayerService, ManagedLayer } from "@/types/map";
import { applyStyle } from "ol-mapbox-style";
import GeoJSON from "ol/format/GeoJSON";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { Layer } from "ol/layer";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import ImageWMS from "ol/source/ImageWMS";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { FC, useCallback, useEffect, useState } from "react";

interface WMTSCapabilitiesMap {
	[url: string]: any;
}

interface LayerCreationResult {
	layer: Layer | null;
	status: ManagedLayer["status"];
	error?: string;
}

const LayerInitializer: FC = () => {
	const config = useMapStore((state) => state.config);
	const map = useMapStore((state) => state.map);
	const setLayersInStore = useMapStore((state) => state.setLayers);

	const [wmtsCapabilities, setWmtsCapabilities] = useState<WMTSCapabilitiesMap>(
		{},
	);
	const [capabilitiesLoaded, setCapabilitiesLoaded] = useState(false);

	// Load WMTS capabilities with server-side caching
	useEffect(() => {
		if (!config) return;

		const loadAllWmtsCapabilities = async () => {
			const allLayers: LayerElement[] = [
				...config.layerConfig.baselayer.elements,
				...config.layerConfig.subjectlayer.elements,
			];

			const wmtsServices = allLayers.filter(
				(layer) =>
					layer.service?.typ === "WMTS" && layer.service.capabilitiesUrl,
			);

			const uniqueCapabilitiesUrls = [
				...new Set(wmtsServices.map((layer) => layer.service.capabilitiesUrl!)),
			];

			if (uniqueCapabilitiesUrls.length === 0) {
				setCapabilitiesLoaded(true);
				return;
			}

			try {
				const capabilitiesPromises = uniqueCapabilitiesUrls.map(async (url) => {
					// Use cached API route instead of direct fetch
					const response = await fetch(
						`/api/wmts-capabilities?url=${encodeURIComponent(url)}`,
					);
					if (!response.ok) {
						throw new Error(
							`Failed to fetch WMTS capabilities from ${url}: ${response.status}`,
						);
					}

					const { xml } = await response.json();
					const parser = new WMTSCapabilities();
					return { url, capabilities: parser.read(xml) };
				});

				const results = await Promise.all(capabilitiesPromises);
				const capabilitiesMap = results.reduce((acc, { url, capabilities }) => {
					acc[url] = capabilities;
					return acc;
				}, {} as WMTSCapabilitiesMap);

				setWmtsCapabilities(capabilitiesMap);
			} catch (error) {
				console.error(
					"[LayerInitializer] Error loading WMTS capabilities:",
					error,
				);
			} finally {
				setCapabilitiesLoaded(true);
			}
		};

		loadAllWmtsCapabilities();
	}, [config]);

	const createWMTSLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			const capabilities = wmtsCapabilities[serviceConfig.capabilitiesUrl!];
			if (!capabilities) {
				return {
					layer: null,
					status: "error",
					error: `WMTS capabilities for ${serviceConfig.capabilitiesUrl} not loaded`,
				};
			}

			try {
				const options = optionsFromCapabilities(capabilities, {
					layer: serviceConfig.layers!,
					matrixSet: serviceConfig.tileMatrixSet!,
				});

				if (!options) {
					return {
						layer: null,
						status: "error",
						error: "Failed to create WMTS options from capabilities",
					};
				}

				const wmtsSource = new WMTS({
					...options,
					attributions: serviceConfig.layerAttribution,
				});

				return {
					layer: new TileLayer({ source: wmtsSource }),
					status: "loaded",
				};
			} catch (error) {
				return {
					layer: null,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown WMTS error",
				};
			}
		},
		[wmtsCapabilities],
	);

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
				});

				return {
					layer: new TileLayer({ source: tileSource }),
					status: "loaded",
				};
			} catch (error) {
				return {
					layer: null,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown WMS error",
				};
			}
		},
		[],
	);

	// Enhanced WFS layer with caching
	const createWFSLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			try {
				const dataProjection = serviceConfig.crs
					? getEpsgFromCrs(serviceConfig.crs)
					: "EPSG:25833";

				const featureProjection =
					config?.portalConfig.map.mapView.epsg || "EPSG:3857";

				const vectorSource = new VectorSource({
					format: new GeoJSON({
						dataProjection: dataProjection,
						featureProjection: featureProjection,
					}),
					url: (extent) => {
						const bbox = extent.join(",");
						// Use cached WFS API route with dynamic EPSG parameters
						return `/api/wfs-cache?service=${encodeURIComponent(serviceConfig.url)}&typename=${serviceConfig.featureType}&bbox=${bbox}&dataProjection=${encodeURIComponent(dataProjection)}&featureProjection=${encodeURIComponent(featureProjection)}`;
					},
					strategy: bboxStrategy,
				});

				return {
					layer: new VectorLayer({ source: vectorSource }),
					status: "loaded",
				};
			} catch (error) {
				return {
					layer: null,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown WFS error",
				};
			}
		},
		[config],
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
				case "WMTS":
					return createWMTSLayer(serviceConfig);
				case "WMS":
					return createWMSLayer(serviceConfig);
				case "WFS":
					return createWFSLayer(serviceConfig);
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
		[createWMTSLayer, createWMSLayer, createWFSLayer, createVectorTileLayer],
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
		if (!config || !map || !capabilitiesLoaded) return;

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
		allManagedLayers.push(...subjectLayers);

		// Update store with all managed layers
		setLayersInStore(allManagedLayers);

		return () => {
			allManagedLayers.forEach((layer) => {
				map.removeLayer(layer.olLayer);
			});
			setLayersInStore([]);
		};
	}, [config, map, capabilitiesLoaded, processLayerGroup, setLayersInStore]);

	return null;
};

export default LayerInitializer;
