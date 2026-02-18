"use client";
import useMobile from "@/lib/utils/useMobile";
import FullScreenControl from "./FullScreenControl";
import ZoomControl from "./ZoomControl";
import LayerTreeControl from "./LayerTreeControl";
import useStore from "@/store/defaultStore";
import LayerTree from "../../LayerTree/LayerTree";
import { useMapStore } from "@/lib/store/mapStore";
import { useMapLoading } from "@/lib/utils/useMapLoading";
import Legende from "../../Legende/Legende";
import MobileLayerTree from "../../LayerTree/MobileLayerTree";
import { Spinner } from "berlin-ui-library";

const MapNavigationControls = () => {
	const isMobile = useMobile();
	const {
		interactiveMap: { isLayerTreeOpen },
	} = useStore();
	const map = useMapStore((s) => s.map);
	const loading = useMapLoading(map);

	return (
		<>
			<div
				className={`absolute z-[2] flex flex-col ${isMobile ? "top-2 right-2 gap-2" : "top-4 right-4 gap-4"}`}
			>
				<div className="relative">
					<FullScreenControl />
				</div>
				<div className="relative">
					<ZoomControl />
				</div>
				{isMobile && (
					<div className="relative">
						<LayerTreeControl />
					</div>
				)}
			</div>
			{!isMobile && (
				<>
					<div
						className={`absolute bottom-4 z-3 ${isLayerTreeOpen ? "left-4" : "right-[30000px]"}`}
					>
						<LayerTree />
					</div>
					<div className="absolute bottom-4 left-4 z-2">
						<LayerTreeControl />
					</div>
				</>
			)}
			<div
				className={`absolute flex items-start gap-2 ${isMobile ? "top-2 left-2" : "top-4 left-4"}`}
			>
				{!isMobile && <Legende />}
				{loading && (
					<div className="align-start z-2 flex">
						<Spinner
							text="Karte lädt..."
							textColor="black"
							position="right"
							size="small"
						/>
					</div>
				)}
			</div>
			{isMobile && (
				<>
					<Legende />
					<MobileLayerTree />
				</>
			)}
		</>
	);
};
export default MapNavigationControls;
