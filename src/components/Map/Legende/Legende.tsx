import React, { useEffect, useState } from "react";
import useStore from "@/store/defaultStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { useMapStore } from "@/lib/store/mapStore";
import Image from "next/image";
import useMobile from "@/lib/utils/useMobile";
import { getHeightClass, getWidthClass } from "@/lib/utils/mapUtils";

const Legende = () => {
	const isLegendeOpen = useStore((state) => state.isLegendeOpen);
	const updateLegendeIsOpen = useStore((state) => state.updateLegendeIsOpen);
	const updateLayerTreeIsOpen = useStore(
		(state) => state.updateLayerTreeIsOpen,
	);
	const fullScreenMap = useStore((state) => state.fullScreenMap);
	const layers = useMapStore((state) => state.layers);
	const subjectLayers = layers.filter((l) => l.layerType === "subject");
	const isMobile = useMobile();
	const isLayerTreeOpen = useStore((state) => state.isLayerTreeOpen);
	const [reopenLegend, setReopenLegend] = useState<boolean>(false);
	const renderConditionallegendes = [
		{
			IDneedsToInclude: "_gefaehrdung_clip_",
			title: "Gefährdung durch Starkregen bzw. Hochwasser",
			src: "/resources/legende/Legende-Gefahrenkarte.jpg",
		},
		{
			IDneedsToInclude: "_fliessgeschw",
			title: "Fließgeschwindigkeit",
			src: "/resources/legende/Legende-Fliessgeschwindigkeit.jpg",
		},
		{
			IDneedsToInclude: "_fr_",
			title: "Fließrichtung",
			src: "/resources/legende/Legende-Fliessrichtung.jpg",
		},
		{
			IDneedsToInclude: "ua_hochwassergefahrenkarten:d_hwgk_gewaesser",
			title: "Gewässer",
			src: "/resources/legende/Legende-Gewaesser.jpg",
		},
		{
			IDneedsToInclude: "ua_hochwassergefahrenkarten",
			IDisNotAllowedToInclude: "d_hwgk_gewaesser",
			title: "Hochwasser",
			src: "/resources/legende/Legende-Hochwasser.jpg",
		},
		{
			IDneedsToInclude: "_wasserstand_",
			title: "Wasserstand",
			src: "/resources/legende/Legende-Wasserstand.jpg",
		},
		{
			IDneedsToInclude: "ueberschwemmungsgebiete",
			title: "Überschwemmungsgebiet",
			src: "/resources/legende/Legende-Ueberschwemmungsgebiet.jpg",
		},
	];

	/* const getLegendUrl = (layer: any): string => {
		const baseUrl = layer.url;
		const version = layer.version || "1.3.0";
		const format = encodeURIComponent(layer.format || "image/png");
		const layerName = layer.layers;
		return `${baseUrl}?SERVICE=WMS&VERSION=${version}&REQUEST=GetLegendGraphic&FORMAT=${format}&LAYER=${layerName}`;
	}; */

	const transformClass = () => {
		if (isMobile && isLegendeOpen) {
			return "translate-y-0";
		}
		if (isMobile) {
			return "translate-y-[calc(100%-46px)]";
		}
		return "";
	};

	const positionScaleLine = () => {
		const scaleLineEl = document.querySelector(".ol-scale-line");
		let setHeight;
		if (!isLegendeOpen && !isLayerTreeOpen) {
			setHeight = 56;
		} else if (isLayerTreeOpen) {
			const getLayerTreeHeight = document.querySelector("#mobile-layer-tree");
			if (getLayerTreeHeight instanceof HTMLElement) {
				setHeight = getLayerTreeHeight.offsetHeight + 56;
			}
		} else if (isLegendeOpen) {
			const getLegendHeight = document.querySelector("#map-legende");
			if (getLegendHeight instanceof HTMLElement) {
				setHeight = getLegendHeight.offsetHeight + 10;
			}
		}
		if (scaleLineEl instanceof HTMLElement && setHeight) {
			scaleLineEl.style.bottom = `${setHeight}px`;
		}
	};

	const getCorrectIcon = () => {
		if (isMobile) {
			return isLegendeOpen ? faArrowDown : faArrowUp;
		}
		return isLegendeOpen ? faArrowUp : faArrowDown;
	};

	useEffect(() => {
		if (!isMobile) {
			return;
		}
		if (isLayerTreeOpen && isLegendeOpen) {
			setReopenLegend(true);
			updateLegendeIsOpen(false);
		} else if (!isLayerTreeOpen && reopenLegend) {
			setReopenLegend(false);
			updateLegendeIsOpen(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLayerTreeOpen]);

	useEffect(() => {
		if (isLayerTreeOpen && isLegendeOpen && isMobile) {
			updateLayerTreeIsOpen(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLegendeOpen]);

	useEffect(() => {
		if (!isMobile) {
			return;
		}
		positionScaleLine();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLegendeOpen, isLayerTreeOpen]);
	useEffect(() => {
		if (!isMobile) {
			return;
		}
		setTimeout(positionScaleLine, 2000);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMobile]);

	return (
		<div
			id="map-legende"
			className={`z-10 bg-white ${isMobile ? "duration-600 absolute bottom-0 w-full transition-transform ease-in-out" : getWidthClass(fullScreenMap)} ${transformClass()}`}
		>
			<div
				className={`border-l-1 border-r-1 border-t-1 flex min-h-[44px] cursor-pointer items-center justify-between border-black pl-4 ${isLegendeOpen ? "border-b-0" : "border-b-1"}`}
				onClick={() => updateLegendeIsOpen(!isLegendeOpen)}
			>
				<p className="select-none font-bold">Legende</p>
				<div
					className={`bg-red border-l-1 border-b-1 inline-flex h-[44px] w-[44px] items-center justify-center border-r-0 border-t-0 border-black ${isLegendeOpen ? "border-b-black" : "border-b-[#E40422]"}`}
				>
					<FontAwesomeIcon
						icon={getCorrectIcon()}
						className="text-[18px] text-white"
					/>
				</div>
			</div>
			{!isMobile && !isLegendeOpen ? null : (
				<div
					className={`border-l-1 border-r-1 border-b-1 flex flex-col gap-2 overflow-y-scroll border-t-0 border-black p-2 ${getHeightClass(isMobile, fullScreenMap)}`}
				>
					<Image
						src="/resources/legende/Adresse.jpg"
						alt="Legend"
						width={200}
						height={0}
						style={{ height: "auto" }}
						className="max-w-[200px]"
					/>
					{renderConditionallegendes.map((legende, index) => {
						const checkForVisibility = subjectLayers
							.filter((layer) => layer.visibility)
							.some((singleLayer) => {
								if (legende.IDisNotAllowedToInclude) {
									return (
										singleLayer.id.includes(legende.IDneedsToInclude) &&
										!singleLayer.id.includes(legende.IDisNotAllowedToInclude)
									);
								}
								return singleLayer.id.includes(legende.IDneedsToInclude);
							});
						if (checkForVisibility) {
							return (
								<div key={index}>
									<p
										className="mb-2 select-none whitespace-normal break-words text-[14px] font-bold leading-[16px]"
										title={legende.title}
									>
										{legende.title}
									</p>
									<Image
										src={legende.src}
										alt="Legende"
										width={200}
										height={0}
										style={{ height: "auto" }}
										className="max-w-[200px]"
									/>
								</div>
							);
						}
						return null;
					})}
				</div>
			)}
		</div>
	);
};

export default Legende;
