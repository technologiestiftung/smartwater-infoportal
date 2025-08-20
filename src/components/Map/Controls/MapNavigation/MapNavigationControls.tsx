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

const MapNavigationControls = () => {
	const { isMobile } = useMobile();
	const isLayerTreeOpen = useStore((state) => state.isLayerTreeOpen);
	const map = useMapStore((s) => s.map);
	const loading = useMapLoading(map);

	return (
		<>
			<div
				className={`absolute z-[2] flex flex-col ${isMobile ? "right-2 top-2 gap-2" : "right-4 top-4 gap-4"}`}
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
						className={`z-3 absolute bottom-4 ${isLayerTreeOpen ? "left-4" : "right-[30000px]"}`}
					>
						<LayerTree />
					</div>
					<div className="z-2 absolute bottom-4 left-4">
						<LayerTreeControl />
					</div>
				</>
			)}
			<div
				className={`absolute flex items-start gap-2 ${isMobile ? "left-2 top-2" : "left-4 top-4"}`}
			>
				{!isMobile && <Legende />}
				{loading && (
					<div className="z-2 flex h-[48px] items-center gap-2">
						<video autoPlay loop muted playsInline width="30">
							<source src="/spinner.mp4" type="video/mp4" />
							Your browser does not support HTML video.
						</video>
						<h4>Karte lädt...</h4>
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
