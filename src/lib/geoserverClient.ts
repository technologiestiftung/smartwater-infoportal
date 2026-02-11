/* eslint-disable */

import proj4 from "proj4";
import { BBox, Building, BuildingWMS, Geometry } from "./types";
import {
	bufferedOutlineMultiPolygonFromBuilding,
	countGeometryPoints,
	transformWMSValue,
} from "./utils/geoServerHelpers";

const notFound = {
	found: false,
	building: null,
};

const notFoundWMS = {
	hasHeavyRainHazardMap: null,
	isInExtremeRainHazardMap: null,
	rareHeavyRainMax: null,
	uncommonHeavyRainMax: null,
	extremeHeavyRainMax: null,
	rareHeavyRainAverage: null,
	uncommonHeavyRainAverage: null,
	extremeHeavyRainAverage: null,
	frequentFloodMax: null,
	averageFloodMax: null,
	rareFloodMax: null,
	frequentFloodAverage: null,
	averageFloodAverage: null,
	rareFloodAverage: null,
};

const extremeHeavyRainMaxAreas = [
	"Obersee",
	"Niederschönhausen Ost",
	"Frankentaler Ufer",
];

const testingMapErrors: string[] = ["extremeHeavyRain"];

export class GeoServerClient {
	private readonly baseUrl?: string;
	private readonly workspace?: string;
	private readonly buildingLayer: string;

	private collectErrors: string[] = [];

	constructor() {
		this.baseUrl = process.env.GEOSERVER_BASE_URL;
		this.workspace = process.env.GEOSERVER_WORKSPACE;
		this.buildingLayer = `${this.workspace}:${process.env.GEOSERVER_BUILDING_LAYER}`;

		proj4.defs(
			"EPSG:25833",
			"+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
		);
	}

	async getBuilding(longitude: number, latitude: number) {
		const locationData = await this.findBuildingAtPoint(longitude, latitude);
		if (!locationData.found || !locationData.building) {
			return {
				locationData,
				buildingWMSData: null,
			};
		}
		const buildingWMSData = await this.getBuildingWMS(locationData.building);
		return {
			locationData,
			buildingWMSData,
		};
	}

	async findBuildingAtPoint(longitude: number, latitude: number) {
		try {
			const [transformedX, transformedY] = proj4("EPSG:4326", "EPSG:25833", [
				longitude,
				latitude,
			]);

			const exactMatch = await this.searchExactIntersection(
				transformedX,
				transformedY,
			);

			if (!exactMatch) {
				return notFound;
			}

			const outlineBufferGeometry = bufferedOutlineMultiPolygonFromBuilding(
				exactMatch.geometry,
			);

			const floodZoneIndex = await this.getFloodZoneIndex(
				outlineBufferGeometry,
			);

			return {
				found: true,
				building: {
					...exactMatch,
					transformedX,
					transformedY,
					outlineBufferGeometry,
					floodZoneIndex: !this.collectErrors.length ? floodZoneIndex : null,
					numberOfBuildings: exactMatch.geometry.coordinates.length,
					numberOfCoordinatesOnBuildings: countGeometryPoints(
						exactMatch.geometry,
					),
					numberOfCoordinatesOnOutline: countGeometryPoints(
						outlineBufferGeometry,
					),
					errors: this.collectErrors,
				},
			};
		} catch {
			return notFound;
		}
	}

	async updateMetric(
		x: number,
		y: number,
		opts: {
			service: string;
			layer: string;
			errorString: string;
			property?: string;
		},
		metric: { max: number; sum: number },
	) {
		const res = await this.getWMSFeatureInfo(
			x,
			y,
			opts.service,
			opts.layer,
			opts.errorString,
			opts.property,
		);

		if (typeof res === "string") {
			const v = transformWMSValue(res);
			metric.sum += v;
			if (v > metric.max) metric.max = v;
			return;
		}
	}

	async getBuildingWMS(building: Building): Promise<BuildingWMS> {
		try {
			const { transformedX, transformedY, geometry, outlineBufferGeometry } =
				building;

			if (
				!geometry ||
				!outlineBufferGeometry ||
				!transformedX ||
				!transformedY
			) {
				return notFoundWMS;
			}

			if (building.errors && building.errors.length > 0) {
				this.collectErrors.push(...building.errors);
			}

			const hasHeavyRainHazardMap = await this.getWMSFeatureInfo(
				transformedX,
				transformedY,
				"ua_srgk",
				"a_modellgebiete",
				"hasHeavyRainHazardMap",
			);

			const isInExtremeRainHazardMap =
				hasHeavyRainHazardMap === "isInExtremeRainHazardMap";

			const rareHeavyRain = { max: 0, sum: 0 };
			const uncommonHeavyRain = { max: 0, sum: 0 };
			const extremeHeavyRain = { max: 0, sum: 0 };

			const frequentFlood = { max: 0, sum: 0 };
			const averageFlood = { max: 0, sum: 0 };
			const rareFlood = { max: 0, sum: 0 };

			const polys =
				outlineBufferGeometry.type === "Polygon"
					? [outlineBufferGeometry.coordinates]
					: outlineBufferGeometry.type === "MultiPolygon"
						? outlineBufferGeometry.coordinates
						: [];

			for (const poly of polys) {
				const ring = Array.isArray(poly) ? poly[0] : null;
				if (!Array.isArray(ring)) continue;

				for (const coord of ring) {
					if (
						!Array.isArray(coord) ||
						coord.length < 2 ||
						typeof coord[0] !== "number" ||
						typeof coord[1] !== "number"
					) {
						continue;
					}

					const x = coord[0];
					const y = coord[1];

					/* STARKREGEN */

					if (hasHeavyRainHazardMap) {
						await this.updateMetric(
							x,
							y,
							{
								service: "ua_srgk",
								layer: "ca_wasserstand_selten",
								property: "Wasserstand_m",
								errorString: "rareHeavyRain",
							},
							rareHeavyRain,
						);
					}
					await this.updateMetric(
						x,
						y,
						{
							service: hasHeavyRainHazardMap ? "ua_srgk" : "ua_srhk",
							layer: hasHeavyRainHazardMap
								? "cb_wasserstand_aussergewoehnlich"
								: "dc_wasserstand_aussergew_kostra",
							property: hasHeavyRainHazardMap
								? "Wasserstand_m"
								: "Wasserstand_cm",
							errorString: "uncommonHeavyRain",
						},
						uncommonHeavyRain,
					);
					await this.updateMetric(
						x,
						y,
						{
							service: isInExtremeRainHazardMap ? "ua_srgk" : "ua_srhk",
							layer: isInExtremeRainHazardMap
								? "cc_wassersand_extrem"
								: "ec_wasserstand_extrem_max100mm",
							property: isInExtremeRainHazardMap
								? "Wasserstand_m"
								: "Wasserstand_cm",
							errorString: "extremeHeavyRain",
						},
						extremeHeavyRain,
					);

					/* FLUSSHOCHWASSER */
					await this.updateMetric(
						x,
						y,
						{
							service: "ua_hochwassergefahrenkarten",
							layer: "a_hwgk_hoch",
							property: "Wassertiefe",
							errorString: "frequentFlood",
						},
						frequentFlood,
					);
					await this.updateMetric(
						x,
						y,
						{
							service: "ua_hochwassergefahrenkarten",
							layer: "b_hwgk_mittel",
							property: "Wassertiefe",
							errorString: "averageFlood",
						},
						averageFlood,
					);
					await this.updateMetric(
						x,
						y,
						{
							service: "ua_hochwassergefahrenkarten",
							layer: "c_hwgk_niedrig",
							property: "Wassertiefe",
							errorString: "rareFlood",
						},
						rareFlood,
					);
				}
			}

			return {
				hasHeavyRainHazardMap,

				isInExtremeRainHazardMap,

				// Starkregen
				rareHeavyRainMax: rareHeavyRain.max,
				uncommonHeavyRainMax: uncommonHeavyRain.max,
				extremeHeavyRainMax: extremeHeavyRain.max,
				rareHeavyRainAverage: Math.round(
					rareHeavyRain.sum / building.numberOfCoordinatesOnOutline!,
				),
				uncommonHeavyRainAverage: Math.round(
					uncommonHeavyRain.sum / building.numberOfCoordinatesOnOutline!,
				),
				extremeHeavyRainAverage: Math.round(
					extremeHeavyRain.sum / building.numberOfCoordinatesOnOutline!,
				),

				// Flusshochwasser
				frequentFloodMax: frequentFlood.max,
				averageFloodMax: averageFlood.max,
				rareFloodMax: rareFlood.max,
				frequentFloodAverage: Math.round(
					frequentFlood.sum / building.numberOfCoordinatesOnOutline!,
				),
				averageFloodAverage: Math.round(
					averageFlood.sum / building.numberOfCoordinatesOnOutline!,
				),
				rareFloodAverage: Math.round(
					rareFlood.sum / building.numberOfCoordinatesOnOutline!,
				),

				// Errors
				errors: this.collectErrors, //.concat(testingMapErrors),
			};
		} catch {
			return notFoundWMS;
		}
	}

	addError(errorString: string) {
		if (!this.collectErrors.some((e) => e === errorString)) {
			this.collectErrors.push(errorString);
		}
	}

	async getWMSFeatureInfo(
		x25833: number,
		y25833: number,
		base: string,
		layer: string,
		errorString: string,
		propertyKey?: string,
	): Promise<string | null> {
		const buffer = 0.5;
		const width = 256;
		const height = 256;

		if (this.collectErrors.some((e) => e === errorString)) {
			return null;
		}

		const minx = x25833 - buffer;
		const miny = y25833 - buffer;
		const maxx = x25833 + buffer;
		const maxy = y25833 + buffer;

		const bbox = [minx, miny, maxx, maxy].join(",");

		const i = Math.floor(((x25833 - minx) / (maxx - minx)) * width);
		const j = Math.floor(((maxy - y25833) / (maxy - miny)) * height);

		const ii = Math.max(0, Math.min(width - 1, i));
		const jj = Math.max(0, Math.min(height - 1, j));

		const url = new URL(`https://gdi.berlin.de/services/wms/${base}`);

		url.searchParams.set("SERVICE", "WMS");
		url.searchParams.set("VERSION", "1.3.0");
		url.searchParams.set("REQUEST", "GetFeatureInfo");

		// Layer you care about
		url.searchParams.set("LAYERS", layer);
		url.searchParams.set("QUERY_LAYERS", layer);

		// Virtual map definition (must match pixel math above)
		url.searchParams.set("CRS", "EPSG:25833");
		url.searchParams.set("BBOX", bbox);
		url.searchParams.set("WIDTH", String(width));
		url.searchParams.set("HEIGHT", String(height));

		// Pixel coordinate (WMS 1.3.0 uses I/J)
		url.searchParams.set("I", String(ii));
		url.searchParams.set("J", String(jj));

		// Ask for JSON like your setup
		url.searchParams.set("INFO_FORMAT", "application/json");
		url.searchParams.set("FEATURE_COUNT", "5");

		// Optional but sometimes helps servers
		url.searchParams.set("STYLES", "");
		url.searchParams.set("FORMAT", "image/png");
		url.searchParams.set("TRANSPARENT", "true");

		try {
			const response = await fetch(url.toString());
			if (!response.ok) {
				console.error(
					"WMS GetFeatureInfo error:",
					response.status,
					response.statusText,
				);
				return null;
			}

			const contentType = response.headers.get("content-type") || "";

			// Some servers may return text/html or text/plain even if you ask for JSON.
			const text = await response.text();

			// Try to parse as JSON if possible
			let json: any = null;
			if (
				contentType.includes("application/json") ||
				contentType.includes("json")
			) {
				try {
					json = JSON.parse(text);
				} catch (e) {
					this.addError(errorString);
					console.warn("WMS returned json content-type but JSON parse failed");
					return null;
				}
			} else {
				try {
					json = JSON.parse(text);
				} catch {
					this.addError(errorString);
					console.error(
						"Unable to parse WMS GetFeatureInfo response as JSON:",
						text,
					);
					return null;
				}
			}

			if (!json) return null;

			const features =
				json.features ??
				json.featureCollection?.features ??
				json?.FeatureCollection?.features ??
				null;

			if (Array.isArray(features)) {
				if (features.length === 0) {
					return null;
				}
				if (layer === "c_ueberschwemmungsgebiete") {
					return "floodZoneIndex";
				} else if (
					layer === "a_modellgebiete" &&
					features[0].properties &&
					features[0].properties?.Gebietsname &&
					extremeHeavyRainMaxAreas.includes(features[0].properties?.Gebietsname)
				) {
					return "isInExtremeRainHazardMap";
				} else if (layer === "a_modellgebiete") {
					return "isInHeavyRainHazardMap";
				} else if (
					!!propertyKey &&
					features[0].properties &&
					propertyKey in features[0].properties
				) {
					const propertyValue = features[0].properties[propertyKey];
					if (
						propertyValue === null ||
						propertyValue === undefined ||
						propertyValue === "0" ||
						propertyValue === "" ||
						propertyValue.trim() === ""
					) {
						return null;
					}
					if (typeof propertyValue === "string") {
						return propertyValue.trim();
					}
				}
				return null;
			}

			console.warn("WMS GetFeatureInfo JSON has no features array.");
			return null;
		} catch (err) {
			this.addError(errorString);
			return null;
		}
	}

	async getFloodZoneIndex(geometry: Geometry): Promise<number> {
		if (!geometry) {
			return 0;
		}
		const polys =
			geometry.type === "Polygon"
				? [geometry.coordinates]
				: geometry.type === "MultiPolygon"
					? geometry.coordinates
					: [];
		if (!polys.length) {
			return 0;
		}

		for (const poly of polys) {
			const ring = Array.isArray(poly) ? poly[0] : null;
			if (!Array.isArray(ring)) continue;

			for (const coord of ring) {
				if (
					!Array.isArray(coord) ||
					coord.length < 2 ||
					typeof coord[0] !== "number" ||
					typeof coord[1] !== "number"
				) {
					continue;
				}

				const x = coord[0];
				const y = coord[1];

				const res = await this.getWMSFeatureInfo(
					x,
					y,
					"ua_uesg",
					"c_ueberschwemmungsgebiete",
					"floodZoneIndex",
				);
				if (!!res) {
					return 1;
				}
			}
		}

		return 0;
	}

	private async searchExactIntersection(
		transformedX: number,
		transformedY: number,
	) {
		const spatialUrl = this.createWFSUrl();
		const intersectsFilter = `INTERSECTS(the_geom, POINT(${transformedX} ${transformedY}))`;
		spatialUrl.searchParams.set("CQL_FILTER", intersectsFilter);
		spatialUrl.searchParams.set("maxFeatures", "1");

		const response = await fetch(spatialUrl.toString());
		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (!data.features || data.features.length === 0) {
			return null;
		}

		const building = data.features[0];
		return this.buildBuildingResult(building);
	}

	private createWFSUrl(): URL {
		const url = new URL(`${this.baseUrl}/ows`);
		url.searchParams.set("service", "wfs");
		url.searchParams.set("version", "1.1.0");
		url.searchParams.set("request", "GetFeature");
		url.searchParams.set("typeName", this.buildingLayer);
		url.searchParams.set("outputFormat", "application/json");
		url.searchParams.set("SRSNAME", "EPSG:25833");
		return url;
	}

	private buildBuildingResult(building: Record<string, unknown>) {
		const props = building.properties as Record<string, unknown>;
		return {
			uuid: props.uuid as string,
			address: props.ad_com as string,
			starkregenGefährdung: (props.GS_SR as number) || 0,
			hochwasserGefährdung: (props.GS_HW as number) || 0,
			geometry: building.geometry as Geometry,
			bbox: building.bbox as BBox,
		};
	}
}
