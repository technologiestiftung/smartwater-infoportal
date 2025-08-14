/* eslint-disable */
"use client";

import { useMapStore } from "@/lib/store/mapStore";
import { ManagedLayer } from "@/types/map";
import { memo, useCallback, useEffect, useMemo } from "react";
import useStore from "@/store/defaultStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faXmark,
	faBars,
	faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
	arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

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

const LayerTree = () => {
	const updateLayerTreeIsOpen = useStore(
		(state) => state.updateLayerTreeIsOpen,
	);
	return (
		<div className="w-[450px] bg-white">
			<div className="flex min-h-[44px] items-center justify-between border-2 border-b-0 border-black pl-4">
				<p className="font-bold">Kartenlayer</p>
				<div
					className="bg-red inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center border-2 border-r-0 border-t-0 border-black"
					onClick={() => updateLayerTreeIsOpen(false)}
				>
					<FontAwesomeIcon icon={faXmark} className="text-[18px] text-white" />
				</div>
			</div>
			<div className="border-2 border-t-0 border-black py-2">
				<LayerTreeContentDraggable />
			</div>
		</div>
	);
};

export const LayerTreeContentDraggable = () => {
	const { subjectLayers } = useLayerData();
	const setLayerOrder = useMapStore((state) => state.setLayerOrder);
	const [items, setItems] = useState<string[]>([]); // just IDs

	useEffect(() => {
		setItems(subjectLayers.map((l) => l.id));
	}, [subjectLayers]);

	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			const oldIndex = items.indexOf(active.id);
			const newIndex = items.indexOf(over.id);
			const newItems = arrayMove(items, oldIndex, newIndex);
			setItems(newItems);
			setLayerOrder(newItems);
		}
	};

	if (subjectLayers.length === 0) {
		return (
			<div className="text-muted-foreground flex items-center justify-center py-8">
				<p>Keine Fachkarten verfügbar</p>
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={items} strategy={verticalListSortingStrategy}>
				<div className="flex max-h-[30dvh] flex-col gap-2 overflow-y-scroll px-2">
					{[...items].reverse().map((id) => {
						const layer = subjectLayers.find((l) => l.id === id);
						return layer ? (
							<SortableLayerItem key={layer.id} layer={layer} />
						) : null;
					})}
				</div>
			</SortableContext>
		</DndContext>
	);
};

const SortableLayerItem = ({ layer }: { layer: ManagedLayer }) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: layer.id,
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} className="bg-grey flex px-2">
			<div
				{...attributes}
				{...listeners}
				className="flex cursor-grab items-center"
				title="Reihenfolge ändern"
			>
				<FontAwesomeIcon icon={faBars} className="text-[18px] text-black" />
			</div>
			<LayerItem layer={layer} />
		</div>
	);
};

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

	const serviceName = layer.config.service.name;
	const mapGroup = layer.config.service.map_group;

	useEffect(() => {
		if (layer.id === "sw_infoportal:sr_gefaehrdung_clip_") {
			handleVisibilityChange(activeMapFilter === "heavyRain");
		} else if (layer.id === "sw_infoportal:hw_gefaehrdung_clip_") {
			handleVisibilityChange(activeMapFilter === "fluvialFlood");
		}
	}, [activeMapFilter]);

	return (
		<div
			className="flex min-w-0 cursor-pointer items-center gap-4 border-black p-3"
			onClick={() => handleVisibilityChange(!layer.visibility)}
		>
			<div className="inline-flex h-[22px] w-[22px] items-center justify-center">
				{layer.visibility ? (
					<FontAwesomeIcon
						icon={faCircleCheck}
						className="text-red text-[18px]"
					/>
				) : (
					<div className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-black" />
				)}
			</div>

			<div className="flex-1 overflow-hidden">
				<p className="overflow-hidden truncate whitespace-nowrap font-bold">
					{serviceName}
				</p>
				<p className="overflow-hidden truncate whitespace-nowrap text-xs">
					{mapGroup}
				</p>
			</div>
		</div>
	);
});

{
	/* <Checkbox
				id={layer.id}
				checked={layer.visibility}
				onCheckedChange={() => {}}
				className="h-6 w-6 rounded-full"
				aria-label={`Toggle visibility for ${serviceName}`}
				disabled={layer.status === "error"}
			/> */
}

LayerItem.displayName = "LayerItem";

export default LayerTree;
