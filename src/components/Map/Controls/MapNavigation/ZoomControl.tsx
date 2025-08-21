/* eslint-disable */
"use client";

import { useMapStore } from "@/lib/store/mapStore";
import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "berlin-ui-library";

const ZoomControl = () => {
	const map = useMapStore((s) => s.map);
	const config = useMapStore((s) => s.config);

	const [canZoomIn, setCanZoomIn] = useState(true);
	const [canZoomOut, setCanZoomOut] = useState(true);

	const updateDisabled = useCallback(() => {
		if (!map) return;
		const view = map.getView();

		const z = view.getZoom() ?? 0;
		const min =
			view.getMinZoom?.() ?? config?.portalConfig.map.mapView.minZoomLevel ?? 0;
		const max =
			view.getMaxZoom?.() ??
			config?.portalConfig.map.mapView.maxZoomLevel ??
			28;

		// booleans mean "action is allowed"
		setCanZoomOut(z > min);
		setCanZoomIn(z < max);
	}, [map, config]);

	useEffect(() => {
		if (!map) return;

		// remove default OL zoom
		map
			.getControls()
			.getArray()
			.forEach((c) => c.constructor.name === "Zoom" && map.removeControl(c));

		const view = map.getView();
		// init state
		updateDisabled();

		// update on any zoom/resolution change
		const onChange = () => updateDisabled();
		view.on("change:resolution", onChange);

		return () => {
			view.un("change:resolution", onChange);
		};
	}, [map, updateDisabled]);

	const handleZoomIn = useCallback(() => {
		if (!map || !canZoomIn) return;
		const view = map.getView();
		const z = view.getZoom();
		if (z !== undefined) view.animate({ zoom: z + 1, duration: 250 });
	}, [map, canZoomIn]);

	const handleZoomOut = useCallback(() => {
		if (!map || !canZoomOut) return;
		const view = map.getView();
		const z = view.getZoom();
		if (z !== undefined) view.animate({ zoom: z - 1, duration: 250 });
	}, [map, canZoomOut]);

	if (!map) return null;

	return (
		<div className="flex flex-col gap-0">
			<Button
				variant="light"
				className="border-1 w-[44px] p-0"
				title="Zoom in"
				onClick={handleZoomIn}
				disabled={!canZoomIn}
				aria-disabled={!canZoomIn}
			>
				<FontAwesomeIcon
					icon={faPlus}
					className={`text-[18px] ${canZoomIn ? "text-black" : "text-gray-500"}`}
				/>
			</Button>
			<Button
				variant="light"
				className="border-1 -mt-[2px] w-[44px] p-0"
				title="Zoom out"
				onClick={handleZoomOut}
				disabled={!canZoomOut}
				aria-disabled={!canZoomOut}
			>
				<FontAwesomeIcon
					icon={faMinus}
					className={`text-[18px] ${canZoomOut ? "text-black" : "text-gray-500"}`}
				/>
			</Button>
		</div>
	);
};

export default ZoomControl;
