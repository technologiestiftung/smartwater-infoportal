import React, { useEffect, useState } from "react";
import useStore from "@/store/defaultStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { useMapStore } from "@/lib/store/mapStore";
import legende from "./legende.json";
import useMobile from "@/lib/utils/useMobile";
import { getHeightClass, getWidthClass } from "@/lib/utils/mapUtils";
import { LegendeItem } from "@/lib/types";

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
					{legende.map((singleLegende, index) => {
						const isAdresse = singleLegende.IDneedsToInclude === "adresse";
						const checkForVisibility = subjectLayers
							.filter((layer) => layer.visibility)
							.some((singleLayer) => {
								if (isAdresse) {
									return true;
								}
								if (singleLegende.IDisNotAllowedToInclude) {
									return (
										singleLayer.id.includes(singleLegende.IDneedsToInclude) &&
										!singleLayer.id.includes(
											singleLegende.IDisNotAllowedToInclude,
										)
									);
								}
								return singleLayer.id.includes(singleLegende.IDneedsToInclude);
							});
						if (checkForVisibility) {
							if (singleLegende.items || isAdresse) {
								return (
									<div key={index}>
										{!isAdresse && (
											<p
												className="mb-2 select-none whitespace-normal break-words text-[14px] font-bold leading-[16px]"
												title={singleLegende.title}
											>
												{singleLegende.title}
											</p>
										)}
										<div className="inline-flex min-w-[213px] flex-col items-start gap-3 px-6 py-4">
											{singleLegende.subTitle && (
												<p className="select-none text-[10px] font-bold leading-[10px] text-black">
													{singleLegende.subTitle}
												</p>
											)}
											{singleLegende.items?.map(
												(legendeItem: LegendeItem, itemIndex) => {
													const getBorder = () => {
														if (
															(singleLegende.IDneedsToInclude ===
																"_fliessgeschw" &&
																!itemIndex) ||
															legendeItem.sub_items
														) {
															return "";
														}
														if (isAdresse) {
															return "border-2 border-red";
														}
														if (legendeItem.background?.includes("url")) {
															return `${legendeItem.background} bg-no-repeat bg-center bg-contain h-[21px] w-full`;
														}
														return "border border-[#B4B4B4]";
													};
													return (
														<div
															key={`${index}_${itemIndex}`}
															className="flex flex-col gap-1.5"
														>
															{legendeItem.subTitle && (
																<p className="select-none text-[10px] leading-[10px] text-black">
																	{legendeItem.subTitle}
																</p>
															)}
															{legendeItem.sub_items ? (
																<>
																	{legendeItem.sub_items.map(
																		(legendeSubItem, legendeSubItemIndex) => (
																			<div
																				key={legendeSubItemIndex}
																				className="flex items-center gap-5"
																			>
																				<div
																					className={`flex h-[21px] w-[36px] ${getBorder()} ${legendeSubItem.background}`}
																				/>
																				{legendeSubItem.title && (
																					<p className="select-none text-[10px] leading-[10px] text-black">
																						{legendeSubItem.title}
																					</p>
																				)}
																			</div>
																		),
																	)}
																</>
															) : (
																<div className="flex items-center gap-5">
																	<div
																		className={`flex h-[21px] w-[36px] ${getBorder()} ${legendeItem.background}`}
																	/>
																	{legendeItem.title && (
																		<p className="select-none text-[10px] leading-[10px] text-black">
																			{legendeItem.title}
																		</p>
																	)}
																</div>
															)}
														</div>
													);
												},
											)}
										</div>
									</div>
								);
							}
							return null;
						}
						return null;
					})}
				</div>
			)}
		</div>
	);
};

export default Legende;
