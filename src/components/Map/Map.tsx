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
	const fullScreenMap = useStore((state) => state.fullScreenMap);
	const { isMobile } = useMobile();
	const getMapRootClasses = () => {
		if (fullScreenMap) {
			return "z-21 fixed left-0 top-0 h-[100lvh] w-[100dvw]";
		}
		if (isMobile) {
			return "relative h-[80lvh] w-full overflow-hidden";
		}
		return "relative h-[65lvh] w-full";
	};
	return (
		<>
			<MapInitializer />
			<div className={`Map-root ${getMapRootClasses()}`}>
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
