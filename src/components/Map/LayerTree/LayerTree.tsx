/* eslint-disable */
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useMapStore } from "@/lib/store/mapStore";
import { ManagedLayer } from "@/types/map";
import { FC, memo, useCallback, useEffect, useMemo } from "react";
import maplist from "@/config/maplist.json";
import useStore from "@/store/defaultStore";

// Custom hooks
const useLayerData = () => {
	const layers = useMapStore((state) => state.layers);

	return useMemo(() => {
		const subjectLayers = layers.filter((l) => l.layerType === "subject");
		const visibleSubjectLayers = subjectLayers.filter((l) => l.visibility);

		const topVisibleLayer = visibleSubjectLayers.reduce(
			(topLayer, currentLayer) => {
				return !topLayer || currentLayer.zIndex > topLayer.zIndex
					? currentLayer
					: topLayer;
			},
			null as ManagedLayer | null,
		);

		return {
			subjectLayers,
			visibleSubjectLayers,
			topVisibleLayer,
			visibleCount: visibleSubjectLayers.length,
		};
	}, [layers]);
};

// Memoized LayerItem component
const LayerItem = memo<{
	layer: ManagedLayer;
}>(({ layer }) => {
	const setLayerVisibility = useMapStore((state) => state.setLayerVisibility);

	const activeMapFilter = useStore((state) => state.activeMapFilter);

	const handleVisibilityChange = useCallback(
		(checked: boolean) => {
			setLayerVisibility(layer.id, checked);
		},
		[layer.id, setLayerVisibility, layer.config.service.legend],
	);

	const hasLegend =
		layer.config.service.legend &&
		typeof layer.config.service.legend === "string";

	const serviceName = layer.config.service.name;
	const serviceNameLang = layer.config.service.name_lang;

	useEffect(() => {
		if (layer.id === "sw_infoportal:sr_gefaehrdung_clip_") {
			handleVisibilityChange(activeMapFilter === "heavyRain");
		} else if (layer.id === "sw_infoportal:hw_gefaehrdung_clip_") {
			handleVisibilityChange(activeMapFilter === "fluvialFlood");
		}
	}, [activeMapFilter]);

	return (
		<div
			className="align-center m-0 flex cursor-pointer gap-4 border-black p-3"
			onClick={() => handleVisibilityChange(!layer.visibility)}
		>
			<Checkbox
				id={layer.id}
				checked={layer.visibility}
				onCheckedChange={() => {}}
				className="h-6 w-6 rounded-full"
				aria-label={`Toggle visibility for ${serviceName}`}
				disabled={layer.status === "error"}
			/>
			<p className="select-none font-bold">{serviceName}</p>
		</div>
	);
});

LayerItem.displayName = "LayerItem";

// Main LayerTree component with scroll container support
const LayerTree: FC = () => {
	return (
		<div className="z-50 w-full bg-white">
			<div className="bg-gray-200 p-2">
				<p className="text-2xl font-bold">Fachkarten</p>
			</div>
			<div className="px-4">
				<LayerTreeContent />
			</div>
		</div>
	);
};

// Updated LayerTreeContent component with accordion control
export const LayerTreeContent: FC<{}> = () => {
	const { subjectLayers } = useLayerData();

	if (subjectLayers.length === 0) {
		return (
			<div className="text-muted-foreground flex items-center justify-center py-8">
				<p>Keine Fachkarten verfügbar</p>
			</div>
		);
	}

	return (
		<div className="flex max-h-[20vh] flex-col overflow-y-scroll py-4">
			{maplist.map((mapListEntry) => (
				<div key={mapListEntry.id} className="mb-4">
					<h3 className="text-lg font-semibold">{mapListEntry.title}</h3>
					{mapListEntry.maps.map((singleMap) => {
						const layer = subjectLayers.find((l) => l.id === singleMap.id);
						return layer ? <LayerItem key={layer.id} layer={layer} /> : null;
					})}
				</div>
			))}
		</div>
	);

	return (
		<div className="flex max-h-[20vh] flex-col overflow-y-scroll py-4">
			{subjectLayers.map((layer) => (
				<LayerItem key={layer.id} layer={layer} />
			))}
		</div>
	);
};

export default LayerTree;
