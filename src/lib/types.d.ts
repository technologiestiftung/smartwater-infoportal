export type HazardLevel = "low" | "moderate" | "high" | "severe";
export type RiskLevel = "low" | "moderate" | "high" | "dontKnow" | "unknown";
import type { Geometry } from "geojson";

export interface CurrentUserAddress {
	lat: string;
	lon: string;
	name: string;
	hasHousenumber: boolean;
	building?: Building | null;
}

export interface Building {
	uuid?: string;
	name?: string;
	alkisAddress?: string;
	starkregenGefährdung?: number;
	hochwasserGefährdung?: number;
	geometry?: Geometry;
	outlineBufferGeometry?: Geometry;
	transformedX?: number;
	transformedY?: number;
	floodZoneIndex?: number | null;
	distance?: number;
	// Old Calc Approach Jakob
	errors?: string[];
	numberOfBuildings?: number;
	numberOfCoordinatesOnBuildings?: number;
	numberOfCoordinatesOnOutline?: number;
	// Old Calc Approach Jakob
}

export type BBox = [number, number, number, number];

export interface LocationData {
	found: boolean;
	building: Building | null;
}

export interface QuestionAnswer {
	value: string | string[] | number;
	score: number;
	addToCounter: number;
	skipNextQuestion?: boolean;
}

export type FloodRiskAnswers = Record<string, QuestionAnswer>;

export interface FloodRiskResult {
	totalScore: number;
	counter: number;
	evaluation: number;
	riskLevel: "low" | "moderate" | "high" | "insufficient-data";
}

export interface LegendeItem {
	background?: string;
	title?: string;
	subTitle?: string;
	sub_items?: { background: string; title: string }[] | undefined;
}

export type AddressResult =
	| { ok: true; data: CurrentUserAddress[] }
	| { ok: false; code: "noResult" | "maptilerError" };

export interface RiskFactor {
	id: string;
	riskLevel: RiskLevel;
	translationKey: string;
	hasInfo: boolean;
}

// Old Calc Approach Jakob
export interface BuildingWMS {
	hasHeavyRainHazardMap: string | null;
	rareHeavyRainMax: number | null;
	uncommonHeavyRainMax: number | null;
	extremeHeavyRainMax: number | null;
	rareHeavyRainAverage: number | null;
	uncommonHeavyRainAverage: number | null;
	extremeHeavyRainAverage: number | null;
	frequentFloodMax: number | null;
	averageFloodMax: number | null;
	rareFloodMax: number | null;
	frequentFloodAverage: number | null;
	averageFloodAverage: number | null;
	rareFloodAverage: number | null;
	errors?: string[];
	isInExtremeRainHazardMap: boolean | null;
}

export type MapFishJobResponse = {
	ref?: string;
	statusURL?: string;
	downloadURL?: string;
};

export type MapFishStatusResponse = {
	done?: boolean;
	status?: string;
	error?: string;
};

export type MapfishImageLayerOverride = {
	type: "image";
	baseURL: string;
	extent: [number, number, number, number];
	imageFormat?: string;
	opacity?: number;
	name?: string;
};

export type MapfishOverrides = {
	center?: [number, number];
	scale?: number;
	basemapImageLayer?: MapfishImageLayerOverride;
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type BasemapServiceConfig = {
	id: string;
	url: string;
	vtStyles?: Array<{ url: string; defaultStyle?: boolean }>;
};

export type ImageLayerOverride = {
	type: "image";
	baseURL: string;
	extent: [number, number, number, number];
	opacity: number;
	imageFormat: "image/png";
	name: string;
};

export type PrintState = {
	loading: boolean;
	imageUrl: string | null;
	basemapPreviewUrl: string | null;
	error: string | null;
};