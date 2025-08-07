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
