import React from "react";
import useStore from "@/store/defaultStore";
import LayerTree from "../LayerTree/LayerTree";
import useMobile from "@/lib/utils/useMobile";

const MobileLayerTree = () => {
	const isLayerTreeOpen = useStore((state) => state.isLayerTreeOpen);
	const { isMobile } = useMobile();

	const transformClass = () => {
		if (isMobile && isLayerTreeOpen) {
			return "translate-y-[-46px]";
		}
		if (isMobile) {
			return "translate-y-[calc(100%)]";
		}
		return "";
	};

	return (
		<div
			id="mobile-layer-tree"
			className={`duration-600 absolute bottom-0 w-full transition-transform ease-in-out ${transformClass()}`} // ${isLayerTreeOpen ? "right-4" : "right-[30000px]"}
		>
			<LayerTree />
		</div>
	);
};

export default MobileLayerTree;
