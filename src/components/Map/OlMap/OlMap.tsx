/* eslint-disable */
"use client";

import appConfig from "@/config/config";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import Map from "ol/Map";
import View from "ol/View";
import { transform } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import React, { FC, useEffect, useRef } from "react";
import "../../../../node_modules/ol/ol.css";
import { useMapStore } from "../../../lib/store/mapStore";
import useStore from "@/store/defaultStore";
import { fixTextEncoding } from "@/lib/utils/mapUtils";
import { Fill, Stroke, Style } from "ol/style";

if (appConfig?.namedProjections?.length) {
	appConfig.namedProjections.forEach(([name, def]) => {
		proj4.defs(name, def);
	});
	register(proj4 as unknown as any);
}

interface OlMapProps {
	children?: React.ReactNode;
}

const highlightStyle = new Style({
	stroke: new Stroke({
		color: "rgba(255, 0, 0, 1)",
		width: 3,
	}),
	fill: new Fill({
		color: "rgba(255, 0, 0, 0.8)",
	}),
});

const OlMap: FC<OlMapProps> = ({ children }) => {
	const setMap = useMapStore((state) => state.populateMap);
	const destroyMap = useMapStore((state) => state.removeMap);
	const config = useMapStore((state) => state.config);
	const mapId = useRef<HTMLDivElement>(null);
	const setCurrentDangerLevel = useStore(
		(state) => state.setCurrentDangerLevel,
	);
	const currentUserCoordinates = useStore(
		(state) => state.currentUserCoordinates,
	);

	const mapClicked = (feature: any) => {
		const properties = feature.getProperties();
		if (properties.GS_SR !== undefined || properties.GS_HW !== undefined) {
			setCurrentDangerLevel({
				address: fixTextEncoding(properties.ad_com || ""),
				GS_SR: properties.GS_SR || 0,
				GS_HW: properties.GS_HW || 0,
			});
		}
	};

	useEffect(() => {
		if (!config) return;

		const mapViewConfig = config.portalConfig.map.mapView;

		const projection = mapViewConfig.epsg;
		let center = mapViewConfig.startCenter;
		let setStartZoomLevel;

		if (currentUserCoordinates) {
			setStartZoomLevel = 14;
			center = [
				currentUserCoordinates.longitude,
				currentUserCoordinates.latitude,
			];
		}

		if (
			center.length === 2 &&
			Math.abs(center[0]) <= 180 &&
			Math.abs(center[1]) <= 90
		) {
			center = transform(center, "EPSG:4326", projection);
		} else if (projection !== "EPSG:25833") {
		}

		const resolutions = mapViewConfig.options
			.sort((a, b) => a.zoomLevel - b.zoomLevel)
			.map((option) => option.resolution);

		const startZoomLevel =
			setStartZoomLevel ||
			Math.max(
				0,
				Math.min(mapViewConfig.startZoomLevel, resolutions.length - 1),
			);
		if (startZoomLevel !== mapViewConfig.startZoomLevel && !setStartZoomLevel) {
			console.warn(
				`[OlMap] Start zoom level ${mapViewConfig.startZoomLevel} is out of range. Using ${startZoomLevel} instead.`,
			);
		}

		if (!mapId.current) {
			console.error("[OlMap] mapId.current is not defined");
			return;
		}

		try {
			const map = new Map({
				target: mapId.current,
				view: new View({
					center: center,
					zoom: startZoomLevel,
					projection: projection,
					extent: mapViewConfig.extent,
					resolutions: resolutions,
					minZoom: 0,
					maxZoom: resolutions.length - 1,
				}),
				controls: [],
			});

			map.on("singleclick", (event) => {
				map.forEachFeatureAtPixel(event.pixel, (feature) =>
					mapClicked(feature),
				);
			});

			if (currentUserCoordinates) {
				map.once("rendercomplete", () => {
					const pixel = map.getPixelFromCoordinate(center);
					map.forEachFeatureAtPixel(pixel, (feature) => mapClicked(feature));
				});
			}

			setMap(map);

			return () => {
				if (map) {
					map.setTarget(undefined);
				}
				destroyMap();
			};
		} catch (error) {
			console.error("[OlMap] Error initializing map:", error);
		}
	}, [config, destroyMap, setMap]);

	return (
		<div ref={mapId} className="map h-[600px] w-full bg-slate-300">
			{children}
		</div>
	);
};

export default OlMap;
