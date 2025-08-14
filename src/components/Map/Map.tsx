"use client";

import dynamic from "next/dynamic";
import { MapControls } from "./Controls";
import MapNavigationControls from "./Controls/MapNavigation/MapNavigationControls";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";
import useStore from "@/store/defaultStore";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Karten werden geladen</div>,
});

const Map = () => {
	const fullScreenMap = useStore((state) => state.fullScreenMap);
	return (
		<>
			<MapInitializer />
			<div
				className={`Map-root ${fullScreenMap ? "z-21 fixed left-0 top-0 h-[100dvh] w-[100dvw]" : "relative h-[65dvh] w-full"}`}
			>
				<LazyOlMap>
					<LayerInitializer />
					<MapControls>
						<MapNavigationControls />
					</MapControls>
				</LazyOlMap>
			</div>
		</>
	);
};

export default Map;
