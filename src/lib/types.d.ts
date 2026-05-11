export type HazardLevel = "none" | "low" | "moderate" | "high" | "severe";
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
	name?: string;
	alkisAddress?: string;
	houseNumber?: string;
	starkregenGefährdung?: number;
	hochwasserGefährdung?: number;
	floodZoneIndex?: number;
	// starkregen
	srgk_amax?: number;
	srgk_amean?: number;
	srgk_smax?: number;
	srgk_smean?: number;
	srgk_emax?: number;
	srgk_emean?: number;
	srhk_amax?: number;
	srhk_amean?: number;
	srhk_emax?: number;
	srhk_emean?: number;
	// hochwasser
	hw_sval_mi?: number;
	hw_hval_ma?: number;
	hw_hval_mi?: number;
	hw_mval_max?: number;
	hw_mval_min?: number;
	hw_sval_ma?: number;
	//coordinates
	transformedX?: number;
	transformedY?: number;
	// geometry
	geometry?: Geometry;
	outlineBufferGeometry?: Geometry;
	distance?: number | undefined;
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
