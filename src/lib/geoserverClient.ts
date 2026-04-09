import proj4 from "proj4";
import type { Geometry } from "geojson";
import {
	bufferedOutlineMultiPolygonFromBuilding,
	isMultiPolygon,
} from "./utils/geoServerHelpers";
import { Building } from "./types";
import { fixMojibake } from "./utils";

export const LocationDataNotFound = {
	found: false,
	building: null,
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

	async findBuilding(longitude: number, latitude: number) {
		try {
			const [transformedX, transformedY] = proj4("EPSG:4326", "EPSG:25833", [
				longitude,
				latitude,
			]);
			let building: Building | null = null;
			building = await this.searchExactIntersection(transformedX, transformedY);
			console.log("exactMatch found 🔍🔍🔍 :>> ", building);
			if (!building) {
				building = await this.searchWithProgressiveBuffers(
					[transformedX, transformedY],
					[longitude, latitude],
				);
				console.log("bufferResult found 🔍🔍🔍 :>> ", building);
				if (!building) {
					return LocationDataNotFound;
				}
			}
			if (!isMultiPolygon(building.geometry)) {
				return LocationDataNotFound;
			}

			const outlineBufferGeometry = bufferedOutlineMultiPolygonFromBuilding(
				building.geometry,
			);

			return {
				found: true,
				building: {
					...building,
					transformedX,
					transformedY,
					outlineBufferGeometry,
				},
			};
		} catch {
			return LocationDataNotFound;
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
		const filterOutKeys = [
			"UUID",
			"H_P_NR",
			"OBJECT_ID",
			"TARGET_FID",
			"Shape_Leng",
			"Shape_Area",
			"NAMLAG",
			"gs_sr",
			"gs_hw",
			"flzone",
		];
		return {
			...Object.fromEntries(
				Object.entries(props).filter(([key]) => !filterOutKeys.includes(key)),
			),
			alkisAddress: fixMojibake(props.NAMLAG as string),
			houseNumber: props.H_P_NR as string,
			starkregenGefährdung: props.gs_sr as number,
			hochwasserGefährdung: props.gs_hw as number,
			floodZoneIndex: props.flzone as number,
			geometry: building.geometry as Geometry,
			...(distance !== undefined && { distance }),
		};
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
