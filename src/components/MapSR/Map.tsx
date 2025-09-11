"use client";

import dynamic from "next/dynamic";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Starkregen Karte wird geladen</div>,
});

const MapSR = () => {
	return (
		<div className="relative">
			<MapInitializer />
			<div className="relative h-[700px] w-[1140px]" id="map-root-sr">
				<LazyOlMap>
					<LayerInitializer />
				</LazyOlMap>
			</div>
		</div>
	);
};

export default MapSR;
