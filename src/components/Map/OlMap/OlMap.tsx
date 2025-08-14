/* eslint-disable */
"use client";

import appConfig from "@/config/config";
import Map from "ol/Map";
import View from "ol/View";
import { transform } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import React, { FC, useEffect, useRef } from "react";
import "../../../../node_modules/ol/ol.css";
import { useMapStore } from "../../../lib/store/mapStore";
import useStore from "@/store/defaultStore";
import VectorSource from "ol/source/Vector";
import { Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import OLGeoJSON from "ol/format/GeoJSON";

if (appConfig?.namedProjections?.length) {
	appConfig.namedProjections.forEach(([name, def]) => {
		proj4.defs(name, def);
	});
	register(proj4 as unknown as any);
}

interface OlMapProps {
	children?: React.ReactNode;
}

const OlMap: FC<OlMapProps> = ({ children }) => {
	const setMap = useMapStore((state) => state.populateMap);
	const destroyMap = useMapStore((state) => state.removeMap);
	const config = useMapStore((state) => state.config);
	const mapId = useRef<HTMLDivElement>(null);
	const currentUserAddress = useStore((state) => state.currentUserAddress);
	const locationData = useStore((state) => state.locationData);

	const checkNumber = (str: string): boolean => {
		return !isNaN(Number(str)) && str.trim() !== "";
	};

	useEffect(() => {
		if (!config) return;

		const mapViewConfig = config.portalConfig.map.mapView;

		const projection = mapViewConfig.epsg;
		let center = mapViewConfig.startCenter;

		if (
			currentUserAddress?.lon &&
			currentUserAddress?.lat &&
			checkNumber(currentUserAddress.lon) &&
			checkNumber(currentUserAddress.lat)
		) {
			center = [Number(currentUserAddress.lon), Number(currentUserAddress.lat)];
		}

		if (
			center.length === 2 &&
			Math.abs(center[0]) <= 180 &&
			Math.abs(center[1]) <= 90
		) {
			center = transform(center, "EPSG:4326", projection);
		} else if (projection !== "EPSG:25833") {
			console.warn(
				"[OlMap] Unsupported projection :>> projection !== EPSG:25833 :>>",
				projection,
			);
		}

		const resolutions = mapViewConfig.options
			.sort((a, b) => a.zoomLevel - b.zoomLevel)
			.map((option) => option.resolution);

		const startZoomLevel = Math.max(
			0,
			Math.min(mapViewConfig.startZoomLevel, resolutions.length - 1),
		);
		if (startZoomLevel !== mapViewConfig.startZoomLevel) {
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

			let highlightLayer: VectorLayer<VectorSource> | null = null;

			if (locationData?.found && locationData?.building?.geometry) {
				const src = new VectorSource({
					features: new OLGeoJSON().readFeatures(
						{
							type: "Feature",
							geometry: locationData.building.geometry,
							properties: {},
						},
						{
							dataProjection: "EPSG:25833",
							featureProjection: projection,
						},
					),
				});

				const layer = new VectorLayer({
					source: src,
					style: new Style({
						stroke: new Stroke({ color: "rgba(255,0,0,1)", width: 6 }),
					}),
				});
				layer.setZIndex(9999);
				map.addLayer(layer);
				highlightLayer = layer;
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
		<div ref={mapId} className="map h-[65vh] w-full bg-slate-300">
			{children}
		</div>
	);
};

export default OlMap;
