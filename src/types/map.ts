import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Layer } from "ol/layer";
import Map from "ol/Map";

export type LayerType = "WMS" | "WFS" | "WMTS" | "VectorTile";
export type LayerStatus = "initial" | "loading" | "loaded" | "error";

export interface MapViewOptions {
	resolution: number;
	scale: number;
	zoomLevel: number;
}

export interface MapViewConfig {
	backgroundImage: string;
	startCenter: number[];
	extent: number[];
	epsg: string;
	startZoomLevel: number;
	options: MapViewOptions[];
}

export interface PortalMapConfig {
	controls: {
		zoom: boolean;
		orientation: {
			zoomMode: string;
		};
	};
	mapView: MapViewConfig;
}

export interface LayerElementBase {
	id: string;
	visibility: boolean;
}

export interface LayerElement extends LayerElementBase {
	id: string;
	visibility: boolean;
	status: LayerStatus;
	service: LayerService;
}

export interface ManagedLayer {
	id: string;
	config: LayerElement;
	olLayer: Layer;
	status: LayerStatus;
	visibility: boolean;
	opacity: number;
	zIndex: number;
	layerType: "base" | "subject";
	error?: string;
}

export interface Dataset {
	md_id: string;
	rs_id: string;
	csw_url: string;
	show_doc_url: string;
}

export interface LayerService {
	id: string;
	name: string;
	name_lang?: string;
	capabilitiesUrl?: string;
	url: string;
	typ: LayerType;
	tileMatrixSet?: string;
	optionsFromCapabilities?: boolean;
	crs: string;
	datasets: Dataset[];
	layers?: string;
	featureType?: string;
	featureNS?: string;
	legend?: string | string[] | boolean;
	layerAttribution?: string;
	format?: string;
	version?: string;
	transparent?: boolean;
	singleTile?: boolean;
	infoFormat?: string;
	vtStyles: VectorTileStyle[];
	preview?: {
		src: string;
	};
}

export interface VectorTileStyle {
	id: string;
	name: string;
	url: string;
	defaultStyle: boolean;
}

export interface LayerConfig {
	baselayer: {
		elements: LayerElement[];
	};
	subjectlayer: {
		elements: LayerElement[];
	};
}
export interface PortalConfig {
	map: PortalMapConfig;
	portalFooter?: { urls: string[] };
}

export interface MapConfig {
	portalConfig: PortalConfig;
	layerConfig: LayerConfig;
}

export interface MapStoreState {
	config: MapConfig | null;
	setConfig: (config: MapConfig) => void;

	// Map
	map: Map | null;
	populateMap: (map: Map) => void;
	removeMap: () => void;

	// LayerTree
	isLayerTreeOpen: boolean;
	setIsLayerTreeOpen: (isOpen: boolean) => void;

	// Layers
	layers: ManagedLayer[];
	setLayers: (layers: ManagedLayer[]) => void;
	addLayer: (layer: ManagedLayer) => void;
	removeLayer: (layerId: string) => void;
	updateLayer: (
		layerId: string,
		updates: Partial<Omit<ManagedLayer, "id">>,
	) => void;
	setLayerVisibility: (layerId: string, visible: boolean) => void;
	setLayerOrder: (orderedIds: string[]) => void;

	// Status
	setLayerStatus: (id: string, status: LayerStatus) => void;
	getLayerStatus: (id: string) => LayerStatus | undefined;

	// Feature
	currentFeature: Feature<Geometry> | null;
	setCurrentFeature: (feature: Feature) => void;
}
