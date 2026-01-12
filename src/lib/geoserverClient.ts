/* eslint-disable */

import proj4 from "proj4";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import { BBox, Geometry } from "./types";
import {
	bufferedPointsFromBuilding,
	valuesByCount,
} from "./utils/geoServerHelpers";

const notFound = {
	found: false,
	buildingInformation: null,
	floodZoneIndex: null,
	isInRareHeavyRainZone: null,
	isInUncommonHeavyRainZone: null,
	isInExtremeHeavyRainZone: null,
};

export class GeoServerClient {
	private readonly baseUrl?: string;
	private readonly workspace?: string;
	private readonly buildingLayer: string;

	constructor() {
		this.baseUrl = process.env.GEOSERVER_BASE_URL;
		this.workspace = process.env.GEOSERVER_WORKSPACE;
		this.buildingLayer = `${this.workspace}:${process.env.GEOSERVER_BUILDING_LAYER}`;

		proj4.defs(
			"EPSG:25833",
			"+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
		);
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

			// console.log("exactMatch :>> ", exactMatch);

			const hasHeavyRainHazardMap = await this.getWMSFeatureInfo(
				transformedX,
				transformedY,
				"ua_srgk",
				"a_modellgebiete",
			);

			/* Obersee => "isInExtremeRainHazardMap";
				a_modellgebiete => "isInHeavyRainHazardMap"; */

			console.log("hasHeavyRainHazardMap :>> ", hasHeavyRainHazardMap);

			if (!exactMatch) {
				return notFound;
			}

			const testPoints = bufferedPointsFromBuilding(exactMatch.geometry);

			const rareHeavyRainValues: string[] = [];
			const uncommonHeavyRainValues: string[] = [];
			const extremeHeavyRainValues: string[] = [];

			for (const [x, y] of testPoints) {
				const isInRareHeavyRainZonePoints = hasHeavyRainHazardMap
					? await this.getWMSFeatureInfo(
							x,
							y,
							"ua_srgk",
							"ca_wasserstand_selten",
							"Wasserstand_m",
							// exactMatch?.bbox,
						)
					: null;
				if (isInRareHeavyRainZonePoints) {
					rareHeavyRainValues.push(isInRareHeavyRainZonePoints);
				}
				const isInUncommonHeavyRainZonePoints = await this.getWMSFeatureInfo(
					x,
					y,
					hasHeavyRainHazardMap ? "ua_srgk" : "ua_srhk",
					hasHeavyRainHazardMap
						? "cb_wasserstand_aussergewoehnlich"
						: "dc_wasserstand_aussergew_kostra",
					hasHeavyRainHazardMap ? "Wasserstand_m" : "Wasserstand_cm",
					// exactMatch?.bbox,
				);

				if (isInUncommonHeavyRainZonePoints) {
					uncommonHeavyRainValues.push(isInUncommonHeavyRainZonePoints);
				}

				const isInExtremeHeavyRainZonePoints = await this.getWMSFeatureInfo(
					x,
					y,
					hasHeavyRainHazardMap === "isInExtremeRainHazardMap"
						? "ua_srgk"
						: "ua_srhk",
					hasHeavyRainHazardMap === "isInExtremeRainHazardMap"
						? "cc_wassersand_extrem"
						: "ec_wasserstand_extrem_max100mm",
					hasHeavyRainHazardMap === "isInExtremeRainHazardMap"
						? "Wasserstand_m"
						: "Wasserstand_cm",
					// exactMatch?.bbox,
				);

				if (isInExtremeHeavyRainZonePoints) {
					extremeHeavyRainValues.push(isInExtremeHeavyRainZonePoints);
				}
			}

			console.log(
				"rareHeavyRainValues :>> ",
				valuesByCount(rareHeavyRainValues),
			);
			console.log(
				"uncommonHeavyRainValues :>> ",
				valuesByCount(uncommonHeavyRainValues),
			);
			console.log(
				"extremeHeavyRainValues :>> ",
				valuesByCount(extremeHeavyRainValues),
			);

			const isFlood = await this.getUeberschwemmungsgebieteWFS(
				transformedX,
				transformedY,
			);
			const floodZoneIndex = typeof isFlood === "boolean" && !!isFlood ? 1 : 0;

			const isInRareHeavyRainZone = hasHeavyRainHazardMap
				? await this.getWMSFeatureInfo(
						transformedX,
						transformedY,
						"ua_srgk",
						"ca_wasserstand_selten",
						"Wasserstand_m",
						exactMatch?.bbox,
					)
				: null;

			console.log("isInRareHeavyRainZone :>> ", isInRareHeavyRainZone);

			const isInUncommonHeavyRainZone = await this.getWMSFeatureInfo(
				transformedX,
				transformedY,
				hasHeavyRainHazardMap ? "ua_srgk" : "ua_srhk",
				hasHeavyRainHazardMap
					? "cb_wasserstand_aussergewoehnlich"
					: "dc_wasserstand_aussergew_kostra",
				hasHeavyRainHazardMap ? "Wasserstand_m" : "Wasserstand_cm",
				exactMatch?.bbox,
			);

			console.log("isInUncommonHeavyRainZone :>> ", isInUncommonHeavyRainZone);

			const isInExtremeHeavyRainZone = await this.getWMSFeatureInfo(
				transformedX,
				transformedY,
				hasHeavyRainHazardMap ? "ua_srgk" : "ua_srhk",
				hasHeavyRainHazardMap
					? "cc_wassersand_extrem"
					: "ec_wasserstand_extrem_max100mm",
				hasHeavyRainHazardMap ? "Wasserstand_m" : "Wasserstand_cm",
				exactMatch?.bbox,
			);

			console.log("isInExtremeHeavyRainZone :>> ", isInExtremeHeavyRainZone);

			if (exactMatch) {
				return {
					found: true,
					buildingInformation: exactMatch,
					floodZoneIndex,
					isInRareHeavyRainZone,
					isInUncommonHeavyRainZone,
					isInExtremeHeavyRainZone,
				};
			}

			const bufferResult = await this.searchWithProgressiveBuffers(
				[transformedX, transformedY],
				[longitude, latitude],
			);
			console.log("bufferResult :>> ", JSON.stringify(bufferResult));
			if (bufferResult) {
				return {
					found: true,
					buildingInformation: bufferResult,
					floodZoneIndex,
					isInRareHeavyRainZone,
					isInUncommonHeavyRainZone,
					isInExtremeHeavyRainZone,
				};
			}

			return {
				found: false,
				buildingInformation: null,
				floodZoneIndex,
				isInRareHeavyRainZone,
				isInUncommonHeavyRainZone,
				isInExtremeHeavyRainZone,
			};
		} catch {
			return notFound;
		}
	}

	isInsideFloodZone(x25833: number, y25833: number, features: any) {
		const p = point([x25833, y25833]);

		for (const f of features) {
			if (booleanPointInPolygon(p, f as any)) {
				return true;
			}
		}

		return false;
	}

	async getUeberschwemmungsgebieteWFS(
		x25833: number,
		y25833: number,
		buffer = 50,
	): Promise<any | null> {
		try {
			// Buffer BBOX exactly like your GetFeatureInfo logic
			const bbox = [
				x25833 - buffer,
				y25833 - buffer,
				x25833 + buffer,
				y25833 + buffer,
			].join(",");

			const url = new URL("https://gdi.berlin.de/services/wfs/ua_uesg");

			url.searchParams.set("SERVICE", "WFS");
			url.searchParams.set("VERSION", "2.0.0");
			url.searchParams.set("REQUEST", "GetFeature");
			url.searchParams.set("TYPENAMES", "ua_uesg:c_ueberschwemmungsgebiete");

			// IMPORTANT: Berlin WFS supports JSON!
			url.searchParams.set("OUTPUTFORMAT", "application/json");

			// coordinate system
			url.searchParams.set("SRSNAME", "EPSG:25833");

			// your dynamic bounding box
			url.searchParams.set("BBOX", bbox);

			const response = await fetch(url.toString());
			if (!response.ok) {
				console.error("WFS error:", response.status, response.statusText);
				return null;
			}

			const json = await response.json();

			if (!json.features || json.features.length === 0) {
				return null;
			}

			const isFlood =
				json.features && this.isInsideFloodZone(x25833, y25833, json.features);

			return isFlood;
		} catch (err) {
			console.error("WFS fetch failed:", err);
			return null;
		}
	}

	async getWMSFeatureInfo(
		x25833: number,
		y25833: number,
		base: string,
		layer: string,
		propertyKey?: string,
		bbBoxFromBuilding?: BBox | null,
		buffer = 2,
		width = 256,
		height = 256,
	): Promise<string | null> {
		try {
			// WMS 1.3.0 uses CRS param name "CRS"
			// BBOX in EPSG:25833 is "minx,miny,maxx,maxy"
			const [rawMinx, rawMiny, rawMaxx, rawMaxy] =
				bbBoxFromBuilding?.length === 4
					? bbBoxFromBuilding
					: [
							x25833 - buffer,
							y25833 - buffer,
							x25833 + buffer,
							y25833 + buffer,
						];

			const minx = rawMinx; // - buffer;
			const miny = rawMiny; // - buffer;
			const maxx = rawMaxx; // + buffer;
			const maxy = rawMaxy; // + buffer;

			const bbox = [minx, miny, maxx, maxy].join(",");

			// Convert point coordinate to pixel i/j in the virtual image
			// x increases left->right, y increases bottom->top in EPSG:25833
			// image j increases top->bottom, so we invert y.
			const i = Math.floor(((x25833 - minx) / (maxx - minx)) * width);
			const j = Math.floor(((maxy - y25833) / (maxy - miny)) * height);

			// Clamp to valid pixel range
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

			/* console.log("");
			console.log("");
			console.log("");
			console.log("url.toString() :>> ", url.toString());
			console.log("");
			console.log("");
			console.log(""); */

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
					console.warn("WMS returned json content-type but JSON parse failed");
					return null;
				}
			} else {
				try {
					json = JSON.parse(text);
				} catch {
					return null;
				}
			}

			if (!json) return null;

			const features =
				json.features ??
				json.featureCollection?.features ??
				json?.FeatureCollection?.features ??
				null;

			if (layer === "a_modellgebiete") {
				console.log("features :>> ", features[0].properties?.Gebietsname);
			}

			if (Array.isArray(features)) {
				if (features.length === 0) {
					return null;
				}
				if (
					layer === "a_modellgebiete" &&
					features[0].properties &&
					features[0].properties?.Gebietsname &&
					features[0].properties?.Gebietsname === "Obersee"
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
						// console.log("VALUE FOUND:", propertyValue.trim());
						return propertyValue.trim();
					}
				}
				return null;
			}

			console.warn("WMS GetFeatureInfo JSON has no features array.");
			return null;
		} catch (err) {
			console.error("WMS GetFeatureInfo fetch failed:", err);
			return null;
		}
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

	private async searchWithProgressiveBuffers(
		transformedCoords: [number, number],
		originalCoords: [number, number],
	) {
		const [transformedX, transformedY] = transformedCoords;
		const [longitude, latitude] = originalCoords;
		const bufferDistances = [5, 10, 15, 25, 50, 100, 200, 500];

		for (const distance of bufferDistances) {
			const result = await this.searchWithBuffer(
				[transformedX, transformedY],
				distance,
				[longitude, latitude],
			);
			if (result) {
				return result;
			}
		}

		return null;
	}

	private async searchWithBuffer(
		transformedCoords: [number, number],
		distance: number,
		originalCoords: [number, number],
	) {
		const [transformedX, transformedY] = transformedCoords;
		const [longitude, latitude] = originalCoords;
		const spatialUrl = this.createWFSUrl();
		const bufferFilter = `DWITHIN(the_geom, POINT(${transformedX} ${transformedY}), ${distance}, meters)`;
		spatialUrl.searchParams.set("CQL_FILTER", bufferFilter);
		spatialUrl.searchParams.set("maxFeatures", "10");

		const response = await fetch(spatialUrl.toString());
		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (!data.features || data.features.length === 0) {
			return null;
		}

		return this.findNearestBuilding(data.features, [longitude, latitude]);
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

	private buildBuildingResult(
		building: Record<string, unknown>,
		distance?: number,
	) {
		const props = building.properties as Record<string, unknown>;
		return {
			uuid: props.uuid as string,
			address: props.ad_com as string,
			starkregenGefährdung: (props.GS_SR as number) || 0,
			hochwasserGefährdung: (props.GS_HW as number) || 0,
			geometry: building.geometry as Geometry,
			bbox: building.bbox as BBox,
			...(distance !== undefined && { distance }),
		};
	}

	private findNearestBuilding(
		features: Record<string, unknown>[],
		coords: [number, number],
	) {
		const [longitude, latitude] = coords;
		let nearestBuilding = null;
		let minDistance = Infinity;

		for (const feature of features) {
			const centroid = this.calculateCentroid(
				feature.geometry as Record<string, unknown>,
			);
			if (!centroid) {
				continue;
			}

			const [centroidX, centroidY] = proj4("EPSG:25833", "EPSG:4326", centroid);
			const distance = this.calculateDistance(
				[longitude, latitude],
				[centroidX, centroidY],
			);

			if (distance < minDistance) {
				minDistance = distance;
				nearestBuilding = feature;
			}
		}

		return nearestBuilding
			? this.buildBuildingResult(nearestBuilding, minDistance)
			: null;
	}

	private calculateCentroid(
		geometry: Record<string, unknown>,
	): [number, number] | null {
		if (!geometry || !geometry.coordinates) {
			return null;
		}

		let coords = geometry.coordinates as number[][];
		if (geometry.type === "MultiPolygon") {
			coords = (geometry.coordinates as number[][][][])[0][0];
		} else if (geometry.type === "Polygon") {
			coords = (geometry.coordinates as number[][][])[0];
		}

		if (!Array.isArray(coords) || coords.length === 0) {
			return null;
		}

		const sumX = coords.reduce(
			(sum: number, coord: number[]) => sum + coord[0],
			0,
		);
		const sumY = coords.reduce(
			(sum: number, coord: number[]) => sum + coord[1],
			0,
		);

		return [sumX / coords.length, sumY / coords.length];
	}

	private calculateDistance(
		coords1: [number, number],
		coords2: [number, number],
	): number {
		const [lon1, lat1] = coords1;
		const [lon2, lat2] = coords2;
		const R = 6371000; // Earth radius in meters
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}
}
