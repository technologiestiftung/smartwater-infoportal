/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromLonLat } from "ol/proj";

function transformCoordinates(
	coordinates: any,
	targetProjection = "EPSG:3857",
) {
	return fromLonLat(coordinates, targetProjection);
}

/**
 * Transform a GeoJSON object from one projection to another.
 * @param {any} geojson - The GeoJSON object to be transformed.
 * @return {void}
 */
export function transformGeoJSON(geojson: any, targetProjection = "EPSG:3857") {
	const transformed = JSON.parse(JSON.stringify(geojson)); // Deep copy

	function transformGeometry(geometry: any) {
		if (geometry.type === "Point") {
			geometry.coordinates = transformCoordinates(
				geometry.coordinates,
				targetProjection,
			);
		} else if (
			geometry.type === "LineString" ||
			geometry.type === "MultiPoint"
		) {
			geometry.coordinates = geometry.coordinates.map(transformCoordinates);
		} else if (
			geometry.type === "Polygon" ||
			geometry.type === "MultiLineString"
		) {
			geometry.coordinates = geometry.coordinates.map((ring: any) =>
				ring.map(transformCoordinates),
			);
		} else if (geometry.type === "MultiPolygon") {
			geometry.coordinates = geometry.coordinates.map((polygon: any) =>
				polygon.map((ring: any) => ring.map(transformCoordinates)),
			);
		}
	}

	if (transformed.type === "Feature") {
		transformGeometry(transformed.geometry);
	} else if (transformed.type === "FeatureCollection") {
		transformed.features.forEach((feature: any) =>
			transformGeometry(feature.geometry),
		);
	}

	return transformed;
}

export function getEpsgFromCrs(crs: string) {
	const epsgMatch = crs.match(/EPSG[:/](\d+)/i);
	return epsgMatch ? `EPSG:${epsgMatch[1]}` : crs;
}

export const getScale = (map: any) => {
	const view = map.getView();
	const resolution = view.getResolution();

	if (!resolution) {
		return null;
	}

	const projection = view.getProjection();
	const metersPerUnit = projection.getMetersPerUnit() || 1;

	return (resolution * metersPerUnit) / 0.00028;
};

export const getHeightClass = (isMobile: boolean, fullScreenMap: boolean) => {
	if (!isMobile && !fullScreenMap) {
		return "max-h-[calc((65vh-60px-46px-46px)/2)]";
	}
	if (!isMobile && fullScreenMap) {
		return "max-h-[calc((100vh-60px-46px-46px)/2)]";
	}
	return "max-h-[calc(40vh-46px-46px)]";
};

export const getWidthClass = (fullScreenMap: boolean) => {
	if (fullScreenMap) {
		return "w-[33vw]";
	}
	return "w-[370px]";
};
