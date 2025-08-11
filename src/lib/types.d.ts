export type HazardLevel = "low" | "moderate" | "high" | "severe";
export type RiskLevel = "low" | "moderate" | "high";

// Address result from Nominatim API
export interface AddressResult {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
	address: {
		[key: string]: string;
	};
	[key: string]: unknown;
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
	[key: string]: unknown;
}

export interface LocationData {
	found: boolean;
	building: Building | null;
	maxGefährdung: number;
	distance?: number;
	floodZoneIndex?: number | null;
}

export interface QuestionAnswer {
	value: string | string[] | number;
	score?: number;
	weight?: number;
}

export type FloodRiskAnswers = Record<string, QuestionAnswer>;

export interface FloodRiskResult {
	totalScore: number;
	riskLevel: "low" | "moderate" | "high" | "insufficient-data";
}
