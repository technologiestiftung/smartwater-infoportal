"use client";

import dynamic from "next/dynamic";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Starkregengefahrenkarte (Selten) wird geladen</div>,
});

const MapSeltenSR = () => {
	return (
		<div className="relative">
			<MapInitializer />
			<div className="relative h-[700px] w-[1140px]" id="map-root-selten-sr">
				<LazyOlMap>
					<LayerInitializer />
				</LazyOlMap>
			</div>
		</div>
	);
};

export default MapSeltenSR;
