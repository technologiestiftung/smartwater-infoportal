"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface WrappingTextBlockProps {
	text: React.ReactNode;
	image: React.ReactNode;
	imageSide?: "left" | "right";
	imageWidth?: "40%" | "50%";
	className?: string;
}

export const WrappingTextBlock: React.FC<WrappingTextBlockProps> = ({
	text,
	image,
	imageSide = "right",
	imageWidth = "50%",
	className,
}) => {
	const widthClass = imageWidth === "40%" ? "lg:w-[40%]" : "lg:w-[50%]";

	return (
		<div className={cn("w-full", className)}>
			<div className="flex flex-col lg:block">
				{/* Image-Container */}
				<div
					className={cn(
						"order-2 mt-6 w-full lg:mt-0",
						imageSide === "right"
							? "lg:float-right lg:mb-2 lg:ml-8"
							: "lg:float-left lg:mr-8 lg:mb-2",
						widthClass,
					)}
				>
					{image}
				</div>

				{/* Text-Container */}
				<div className="order-1">{text}</div>

				{/* Clearfix for Desktop Float */}
				<div className="clear-both" />
			</div>
		</div>
	);
};

export default WrappingTextBlock;
