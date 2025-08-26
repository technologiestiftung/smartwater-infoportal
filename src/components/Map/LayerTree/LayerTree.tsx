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
import { getHeightClass, getScale, getWidthClass } from "@/lib/utils/mapUtils";
import useMobile from "@/lib/utils/useMobile";

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
	const fullScreenMap = useStore((state) => state.fullScreenMap);
	const isMobile = useMobile();
	return (
		<div
			className={`bg-white ${isMobile ? "w-full" : getWidthClass(fullScreenMap)}`}
		>
			<div className="border-l-1 border-r-1 border-t-1 flex min-h-[44px] items-center justify-between border-b-0 border-black pl-4">
				<p className="select-none font-bold">Kartenlayer</p>
				<div
					className="bg-red border-1 inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center border-r-0 border-t-0 border-black"
					onClick={() => updateLayerTreeIsOpen(false)}
				>
					<FontAwesomeIcon icon={faXmark} className="text-[18px] text-white" />
				</div>
			</div>
			<div
				className={`border-l-1 border-r-1 border-t-0 border-black py-2 ${isMobile ? "border-b-0" : "border-b-1"}`}
			>
				<LayerTreeContentDraggable />
			</div>
		</div>
	);
};

const LayerTreeContentDraggable = () => {
	const { subjectLayers } = useLayerData();
	const errorLayers = useStore((state) => state.errorLayers);
	const isMobile = useMobile();
	const fullScreenMap = useStore((state) => state.fullScreenMap);
	const setLayerOrder = useMapStore((state) => state.setLayerOrder);
	const map = useMapStore((s) => s.map);
	const [items, setItems] = useState<string[]>([]);
	const [disabledLayers, setDisabledLayers] = useState<string[]>([]);

	useEffect(() => {
		setItems(subjectLayers.map((l) => l.id));
	}, [subjectLayers]);

	useEffect(() => {
		if (!map || subjectLayers.length === 0) return;

		const handler = () => {
			const scale = getScale(map);
			if (!scale) return;

			setDisabledLayers([]);

			subjectLayers.forEach((layer) => {
				const maxScale = parseFloat(layer.config.service.maxScale || "0");

				const shouldBeVisible = maxScale === 0 || scale <= maxScale;
				if (!shouldBeVisible) {
					setDisabledLayers((prev) => [...prev, layer.id]);
				}
			});
		};

		map.on("moveend", handler);

		// Run once on mount
		handler();

		return () => {
			map.un("moveend", handler);
		};
	}, [map, subjectLayers]);

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
				<div
					className={`flex flex-col gap-2 overflow-y-scroll px-2 ${getHeightClass(isMobile, fullScreenMap)}`}
				>
					{[...items].reverse().map((id) => {
						const layer = subjectLayers.find((l) => l.id === id);
						return layer ? (
							<SortableLayerItem
								key={layer.id}
								layer={layer}
								disabledLayers={disabledLayers}
								errorLayers={errorLayers}
							/>
						) : null;
					})}
				</div>
			</SortableContext>
		</DndContext>
	);
};

const SortableLayerItem = ({
	layer,
	disabledLayers,
	errorLayers,
}: {
	layer: ManagedLayer;
	disabledLayers: string[];
	errorLayers: string[];
}) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: layer.id,
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const disabled = disabledLayers.includes(layer.id);
	const isNotAvailable = !!layer.error || errorLayers.includes(layer.id);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex px-2 ${disabled || isNotAvailable ? "bg-[#FDECEE]" : "bg-grey"}`}
		>
			{!isNotAvailable && (
				<div
					{...attributes}
					{...listeners}
					className="flex cursor-grab items-center"
					title="Reihenfolge ändern"
				>
					<FontAwesomeIcon
						icon={faBars}
						className="text-[18px] text-[#D2D2D2]"
					/>
				</div>
			)}
			<LayerItem
				layer={layer}
				disabled={disabled}
				isNotAvailable={isNotAvailable}
			/>
		</div>
	);
};

const LayerItem = memo<{
	layer: ManagedLayer;
	disabled: boolean;
	isNotAvailable: boolean;
}>(({ layer, disabled, isNotAvailable }) => {
	const setLayerVisibility = useMapStore((state) => state.setLayerVisibility);

	const activeMapFilter = useStore((state) => state.activeMapFilter);

	const handleVisibilityChange = useCallback(
		(checked: boolean) => {
			setLayerVisibility(layer.id, checked);
		},
		[layer.id, setLayerVisibility, layer.config.service.legend],
	);

	const serviceName = layer.config.service.name;
	const serviceNameLang = layer.config.service.name_lang || serviceName;
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
			className={`flex min-w-0 items-center gap-4 border-black px-2 py-1 ${disabled || isNotAvailable ? "cursor-not-allowed" : "cursor-pointer"}`}
			onClick={() => {
				if (disabled) return;
				handleVisibilityChange(!layer.visibility);
			}}
		>
			{!isNotAvailable && (
				<div className="inline-flex h-[22px] w-[22px] items-center justify-center">
					{layer.visibility ? (
						<FontAwesomeIcon
							icon={faCircleCheck}
							className={`text-[18px] ${disabled ? "text-[#DCDCDC]" : "text-red"}`}
						/>
					) : (
						<div
							className={`border-1 h-[18px] w-[18px] shrink-0 rounded-full ${disabled ? "border-[#DCDCDC]" : "border-black"}`}
						/>
					)}
				</div>
			)}
			<div className="flex-1 overflow-hidden">
				<p
					className="translate-y-[2px] select-none overflow-hidden truncate whitespace-nowrap text-[14px] font-bold"
					title={serviceNameLang}
				>
					{serviceName}
				</p>
				{disabled || isNotAvailable ? (
					<p className="translate-y-[-2px] overflow-hidden truncate whitespace-nowrap text-xs text-[var(--text-error)]">
						{isNotAvailable
							? "Karte konnte nicht geladen werden"
							: "Karte wird im aktuellen Maßstab nicht angezeigt"}
					</p>
				) : (
					<p className="translate-y-[-2px] overflow-hidden truncate whitespace-nowrap text-xs">
						{mapGroup}
					</p>
				)}
			</div>
		</div>
	);
});

export default LayerTree;
