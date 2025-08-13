"use client";

import dynamic from "next/dynamic";
import { FC } from "react";
import { MapControls } from "./Controls";
import MapNavigationControls from "./Controls/MapNavigation/MapNavigationControls";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";
import LayerTree from "./LayerTree/LayerTree";

/* const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Karten werden geladen</div>,
}); */
const LazyOlMap = dynamic(
	() => import("./OlMap/OlMap").then((mod) => mod.default),
	{
		ssr: false,
		loading: () => <div>Karten werden geladen</div>,
	},
);

const Map: FC = () => {
	return (
		<>
			<MapInitializer />
			<div className="Map-root relative h-full w-full">
				<LazyOlMap>
					<LayerInitializer />
					<MapControls>
						<MapNavigationControls />
					</MapControls>
				</LazyOlMap>
				<LayerTree />
			</div>
		</>
	);
};

export default Map;
