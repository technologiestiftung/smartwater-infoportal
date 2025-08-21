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
	const isLayerTreeOpen = useStore((state) => state.isLayerTreeOpen);
	const createReport = useStore((state) => state.createReport);
	const map = useMapStore((s) => s.map);
	const loading = useMapLoading(map);

	const getPositionOfDesktopLayerTree = () => {
		if (createReport || !isLayerTreeOpen) {
			return "right-[30000px]";
		}
		return "left-4";
	};

	return (
		<>
			<div
				className={`absolute z-[2] flex flex-col ${isMobile ? "right-2 top-2 gap-2" : "right-4 top-4 gap-4"}`}
			>
				{!createReport && (
					<>
						<div className="relative">
							<FullScreenControl />
						</div>
						<div className="relative">
							<ZoomControl />
						</div>
					</>
				)}
				{isMobile && !createReport && (
					<div className="relative">
						<LayerTreeControl />
					</div>
				)}
			</div>
			{!isMobile && (
				<>
					<div
						className={`z-3 absolute bottom-4 ${getPositionOfDesktopLayerTree()}`}
					>
						<LayerTree />
					</div>
					{!createReport && (
						<div className="z-2 absolute bottom-4 left-4">
							<LayerTreeControl />
						</div>
					)}
				</>
			)}
			<div
				className={`absolute flex items-start gap-2 ${isMobile ? "left-2 top-2" : "left-4 top-4"}`}
			>
				{!isMobile && !createReport && <Legende />}
				{loading && (
					<div className="z-2 align-start flex">
						<Spinner
							text="Karte lädt..."
							textColor="black"
							position="right"
							size="small"
						/>
					</div>
				)}
			</div>
			{isMobile && !createReport && (
				<>
					<Legende />
					<MobileLayerTree />
				</>
			)}
		</>
	);
};
export default MapNavigationControls;
