/* eslint-disable */
"use client";

import appConfig from "@/config/config";
import Map from "ol/Map";
import View from "ol/View";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import React, { FC, useEffect, useRef } from "react";
import "../../../../node_modules/ol/ol.css";
import { useMapStore } from "../../../lib/store/mapStore";
import VectorSource from "ol/source/Vector";
import { Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import OLGeoJSON from "ol/format/GeoJSON";
import ScaleLine from "ol/control/ScaleLine";
import { Scenario } from "@/types/map";
import { transform } from "ol/proj";
import { getSafeFitExtent } from "@/lib/utils";

if (appConfig?.namedProjections?.length) {
	appConfig.namedProjections.forEach(([name, def]) => {
		proj4.defs(name, def);
	});
	register(proj4 as unknown as any);
}

interface OlMapProps {
	children?: React.ReactNode;
	scenario: Scenario;
}

const OlMap: FC<OlMapProps> = ({ children, scenario }) => {
	const setMap = useMapStore((s) => s.populateScenarioMap);
	const destroyMap = useMapStore((s) => s.removeScenarioMap);
	const config = useMapStore((s) => s.scenarioConfig[scenario]);
	const mapId = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!config) return;

		const injected =
			typeof window !== "undefined"
				? // @ts-expect-error
					(window.__SCENARIO_INPUT__ ?? null)
				: null;

		const buildingGeometry = injected?.buildingGeometry;
		const outlineBufferGeometry = injected?.outlineBufferGeometry;

		const mapViewConfig = config.portalConfig.map.mapView;

		const projection = mapViewConfig.epsg;
		let center = mapViewConfig.startCenter;

		const resolutions = mapViewConfig.options
			.sort((a, b) => a.zoomLevel - b.zoomLevel)
			.map((option) => option.resolution);

		if (!mapId.current) {
			console.error("[OlMap] mapId.current is not defined");
			return;
		}

		try {
			const map = new Map({
				target: mapId.current,
				view: new View({
					center: center,
					zoom: 9,
					projection: projection,
					extent: mapViewConfig.extent,
					resolutions: resolutions,
					minZoom: mapViewConfig.minZoomLevel,
					maxZoom: 12,
				}),
				controls: [],
			});

			if (buildingGeometry) {
				const feature = new OLGeoJSON().readFeature(
					{
						type: "Feature",
						geometry: buildingGeometry,
						properties: {},
					},
					{
						dataProjection: "EPSG:25833",
						featureProjection: projection,
					},
				);

				const features = Array.isArray(feature) ? feature : [feature];

				if (features.length > 0) {
					// const extent = features[0].getGeometry()?.getExtent();
					const geom = features[0].getGeometry();
					const extent = getSafeFitExtent(geom, {
						ratioThreshold: 10,
						maxSizeMeters: 20_000,
					});
					if (extent) {
						map.getView().fit(extent, {
							padding: mapViewConfig.padding,
							maxZoom: 19,
						});
					}
				}
			} else if (scenario === "SRHK_UNCOMMON_HEAVY_RAIN") {
				{
					const lon = 13.342964712531607;
					const lat = 52.525293291622035;

					const center = transform([lon, lat], "EPSG:4326", projection);

					map.getView().setCenter(center);
				}
			}

			if (buildingGeometry) {
				const src = new VectorSource({
					features: new OLGeoJSON().readFeatures(
						{
							type: "Feature",
							geometry: buildingGeometry,
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

				if (
					(scenario.includes("HEAVY_RAIN") || scenario.includes("FLOOD")) &&
					!!outlineBufferGeometry
				) {
					const outlineBufferSRC = new VectorSource({
						features: new OLGeoJSON().readFeatures(
							{
								type: "Feature",
								geometry: outlineBufferGeometry,
								properties: {},
							},
							{ dataProjection: "EPSG:25833", featureProjection: projection },
						),
					});

					const outlineBufferLayer = new VectorLayer({
						source: outlineBufferSRC,
						style: new Style({
							stroke: new Stroke({ color: "rgba(0,0,255,1)", width: 2 }),
						}),
					});

					outlineBufferLayer.setZIndex(9998);
					map.addLayer(outlineBufferLayer);
				}
			}

			const scaleLineControl = new ScaleLine({
				units: "metric",
				bar: false,
				text: true,
			});

			map.addControl(scaleLineControl);

			setMap(scenario, map);

			return () => {
				if (map) {
					map.setTarget(undefined);
				}
				destroyMap(scenario);
			};
		} catch (error) {
			console.error("[OlMap] Error initializing map:", error);
		}
	}, [config, destroyMap, setMap, scenario]);

	return (
		<div ref={mapId} className="map h-full w-full bg-slate-300">
			{children}
		</div>
	);
};

export default OlMap;
