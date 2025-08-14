import React from "react";
import useStore from "@/store/defaultStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { useMapStore } from "@/lib/store/mapStore";
import Image from "next/image";

const Legende = () => {
	const isLegendeOpen = useStore((state) => state.isLegendeOpen);
	const updateLegendeIsOpen = useStore((state) => state.updateLegendeIsOpen);
	const layers = useMapStore((state) => state.layers);
	const subjectLayers = layers.filter((l) => l.layerType === "subject");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getLegendUrl = (layer: any): string => {
		const baseUrl = layer.url;
		const version = layer.version || "1.3.0";
		const format = encodeURIComponent(layer.format || "image/png");
		const layerName = layer.layers;
		return `${baseUrl}?SERVICE=WMS&VERSION=${version}&REQUEST=GetLegendGraphic&FORMAT=${format}&LAYER=${layerName}`;
	};

	return (
		<div className="z-2 w-[300px] bg-white">
			<div
				className={`flex min-h-[44px] cursor-pointer items-center justify-between border-2 border-black pl-4 ${isLegendeOpen ? "border-b-0" : ""}`}
				onClick={() => updateLegendeIsOpen(!isLegendeOpen)}
			>
				<p className="font-bold">Legende</p>
				<div
					className={`bg-red inline-flex h-[44px] w-[44px] items-center justify-center border-2 border-r-0 border-t-0 border-black ${isLegendeOpen ? "border-b-black" : "border-b-[#E40422]"}`}
				>
					<FontAwesomeIcon
						icon={isLegendeOpen ? faArrowUp : faArrowDown}
						className="text-[18px] text-white"
					/>
				</div>
			</div>
			{isLegendeOpen && (
				<div className="flex max-h-[30dvh] flex-col gap-4 overflow-y-scroll border-2 border-t-0 border-black p-2">
					<Image
						src="/resources/legende/Adresse.jpg"
						alt="Legend"
						width={200}
						height={0}
						style={{ height: "auto" }}
						className="max-w-[200px]"
					/>
					{subjectLayers
						.filter((layer) => layer.visibility)
						.sort((a, b) => b.zIndex - a.zIndex)
						.map((layer, index) => (
							<div key={index}>
								<p className="text-bold whitespace-normal break-words">
									{layer.config.service.name}
								</p>
								<Image
									src={
										typeof layer.config.service.legend === "string"
											? layer.config.service.legend
											: getLegendUrl(layer.config.service)
									}
									alt="Legend"
									width={200}
									height={0}
									style={{ height: "auto" }}
									className="max-w-[200px]"
								/>
							</div>
						))}
				</div>
			)}
		</div>
	);
};

export default Legende;
