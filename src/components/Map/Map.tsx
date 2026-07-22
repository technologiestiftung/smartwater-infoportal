"use client";

import dynamic from "next/dynamic";
import { MapControls } from "./Controls";
import MapNavigationControls from "./Controls/MapNavigation/MapNavigationControls";
import MapInitializer from "./MapInitializer/MapInitializer";
import LayerInitializer from "./LayerInitializer/LayerInitializer";
import useStore from "@/store/defaultStore";
import useMobile from "@/lib/utils/useMobile";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Karten werden geladen</div>,
});

const Map = () => {
	const {
		interactiveMap: { fullScreenMap },
	} = useStore();
	const isMobile = useMobile();
	const getMapRootClasses = () => {
		if (fullScreenMap) {
			return "z-21 fixed left-0 top-0 h-full w-[100vw]";
		}
		if (isMobile) {
			return "relative h-[80lvh] w-full overflow-hidden";
		}
		return "relative h-[65lvh] w-full";
	};
	return (
		<>
			<MapInitializer />
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:border-2 focus:border-black focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-text-link focus:outline-2 focus:outline-offset-2 focus:outline-black"
				href="#after-map"
			>
				Karte überspringen
			</a>
			<div className={`Map-root ${getMapRootClasses()}`}>
				<LazyOlMap>
					<LayerInitializer />
					<MapControls>
						<MapNavigationControls />
					</MapControls>
				</LazyOlMap>
			</div>
			<div id="after-map" tabIndex={-1} className="sr-only">
				Ende der Karte
			</div>
		</>
	);
};

export default Map;
