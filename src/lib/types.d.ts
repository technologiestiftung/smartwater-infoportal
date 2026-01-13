export type HazardLevel = "low" | "moderate" | "high" | "severe";
export type RiskLevel = "low" | "moderate" | "high";

export interface CurrentUserAddress {
	lat: string;
	lon: string;
	name: string;
	type?: string;
}

// GeoJSON geometry types
export interface Geometry {
	type:
		| "Point"
		| "LineString"
		| "Polygon"
		| "MultiPoint"
		| "MultiLineString"
		| "MultiPolygon";
	coordinates: number[] | number[][] | number[][][] | number[][][][];
}

export interface Building {
	uuid?: string;
	address?: string;
	starkregenGefährdung?: number;
	hochwasserGefährdung?: number;
	geometry?: Geometry;
	distance?: number;
	outlineBufferGeometry?: [number, number][];
	transformedX?: number;
	transformedY?: number;
	floodZoneIndex?: number;
	[key: string]: unknown;
}

export interface BuildingWMS {
	hasHeavyRainHazardMap: string | null;
	rareHeavyRain: number | null;
	uncommonHeavyRain: number | null;
	extremeHeavyRain: number | null;
}

export type BBox = [number, number, number, number];

export interface LocationData {
	found: boolean;
	building: Building | null;
	distance?: number;
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
