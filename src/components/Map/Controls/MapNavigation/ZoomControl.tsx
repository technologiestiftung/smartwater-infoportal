/* eslint-disable */
"use client";

import { useMapStore } from "@/lib/store/mapStore";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

const ZoomControl = () => {
	const map = useMapStore((state) => state.map);

	const handleZoomIn = useCallback(() => {
		if (!map) return;
		const view = map.getView();
		const zoom = view.getZoom();
		if (zoom !== undefined) {
			view.animate({ zoom: zoom + 1, duration: 250 });
		}
	}, [map]);

	const handleZoomOut = useCallback(() => {
		if (!map) return;
		const view = map.getView();
		const zoom = view.getZoom();
		if (zoom !== undefined) {
			view.animate({ zoom: zoom - 1, duration: 250 });
		}
	}, [map]);

	// Remove default zoom control
	useEffect(() => {
		if (!map) return;

		const existingControls = map.getControls().getArray();
		existingControls.forEach((control) => {
			if (control.constructor.name === "Zoom") {
				map.removeControl(control);
			}
		});
	}, [map]);

	if (!map) return null;

	return (
		<div className="hidden flex-col gap-2 md:flex">
			<Button
				variant="map-icon"
				size="icon-only"
				title="Zoom in"
				onClick={handleZoomIn}
			>
				<img src="/map-icons/plus.svg" alt="Zoom in" width={24} height={24} />
			</Button>
			<Button
				variant="map-icon"
				size="icon-only"
				title="Zoom out"
				onClick={handleZoomOut}
			>
				<img src="/map-icons/minus.svg" alt="Zoom out" width={24} height={24} />
			</Button>
		</div>
	);
};

export default ZoomControl;
