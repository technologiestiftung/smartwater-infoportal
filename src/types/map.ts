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
	minZoomLevel: number;
	maxZoomLevel: number;
	options: MapViewOptions[];
	padding: number[];
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
	map_group: string;
}

export interface ManagedLayer {
	id: string;
	config: LayerElement;
	olLayer: Layer;
	status: LayerStatus;
	visibility: boolean;
	map_group: string;
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
	map_group: string;
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
	maxScale?: string;
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

export type Scenario =
	| "SR"
	| "HW"
	| "SRGK_RARE_HEAVY_RAIN"
	| "SRGK_UNCOMMON_HEAVY_RAIN"
	| "SRGK_EXTREME_HEAVY_RAIN"
	| "SRHK_UNCOMMON_HEAVY_RAIN"
	| "SRHK_EXTREME_HEAVY_RAIN"
	| "FREQUENT_FLOOD"
	| "AVERAGE_FREQUENT_FLOOD"
	| "RARE_FREQUENT_FLOOD"
	| "FLOOD_ZONE";

export const ScenarioList: Scenario[] = [
	"SR",
	"HW",
	"SRGK_RARE_HEAVY_RAIN",
	"SRGK_UNCOMMON_HEAVY_RAIN",
	"SRGK_EXTREME_HEAVY_RAIN",
	"SRHK_UNCOMMON_HEAVY_RAIN",
	"SRHK_EXTREME_HEAVY_RAIN",
	"FREQUENT_FLOOD",
	"AVERAGE_FREQUENT_FLOOD",
	"RARE_FREQUENT_FLOOD",
	"FLOOD_ZONE",
];

type ScenarioMap<T> = Partial<Record<Scenario, T>>;

export const SUBJECT_LAYER_BY_SCENARIO: Record<Scenario, string[]> = {
	SR: ["sw_infoportal:sr_gefaehrdung_clip_"],
	HW: ["sw_infoportal:hw_gefaehrdung_clip_"],
	SRGK_RARE_HEAVY_RAIN: ["ua_srgk:ca_wasserstand_selten"],
	SRGK_UNCOMMON_HEAVY_RAIN: ["ua_srgk:cb_wasserstand_aussergewoehnlich"],
	SRGK_EXTREME_HEAVY_RAIN: ["ua_srgk:cc_wassersand_extrem"],
	SRHK_UNCOMMON_HEAVY_RAIN: ["ua_srhk:dc_wasserstand_aussergew_kostra"],
	SRHK_EXTREME_HEAVY_RAIN: ["ua_srhk:ec_wasserstand_extrem_max100mm"],
	FREQUENT_FLOOD: ["ua_hochwassergefahrenkarten:a_hwgk_hoch"],
	AVERAGE_FREQUENT_FLOOD: ["ua_hochwassergefahrenkarten:b_hwgk_mittel"],
	RARE_FREQUENT_FLOOD: ["ua_hochwassergefahrenkarten:c_hwgk_niedrig"],
	FLOOD_ZONE: ["ua_uesg:c_ueberschwemmungsgebiete"],
};

export interface MapStoreState {
	// Scenario Map Approach
	scenarioConfig: ScenarioMap<MapConfig | null>;
	setScenarioConfig: (scenario: Scenario, config: MapConfig | null) => void;
	scenarioMap: ScenarioMap<Map | null>;
	populateScenarioMap: (scenario: Scenario, map: Map | null) => void;
	removeScenarioMap: (scenario: Scenario) => void;
	scenarioLayers: ScenarioMap<LayerElement[]>;
	setScenarioLayers: (scenario: Scenario, layers: ManagedLayer[]) => void;

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
