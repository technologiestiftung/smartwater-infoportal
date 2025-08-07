export type HazardLevel = "none" | "low" | "moderate" | "high" | "severe";
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
	found?: boolean;
	[key: string]: unknown;
}

export interface LocationData {
	found: boolean;
	building: Building | null;
	maxGefährdung: number;
	distance?: number;
}
