export type HazardLevel = "low" | "moderate" | "high" | "severe";
export type RiskLevel = "low" | "moderate" | "high" | "dontKnow" | "unknown";

export interface CurrentUserAddress {
	lat: string;
	lon: string;
	name: string;
	hasHousenumber: boolean;
	alkisName?: string;
	building?: Building | null;
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
	outlineBufferGeometry?: Geometry;
	transformedX?: number;
	transformedY?: number;
	floodZoneIndex?: number | null;
	errors?: string[];
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
