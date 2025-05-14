"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

interface TextBlockProps {
	slotA?: React.ReactNode;
	slotB?: React.ReactNode;
	slotC?: React.ReactNode;
	slotD?: React.ReactNode;
	/**
	 * Defines the column spans for the two visual columns on desktop.
	 * e.g., { col1: 1, col2: 1 } for a 50/50 split.
	 * e.g., { col1: 2, col2: 3 } for a 2/5 and 3/5 split.
	 * col1 refers to the first visual column, col2 to the second.
	 */
	desktopColSpans?: { col1: number; col2: number };
	/**
	 * If true, on desktop, slots B & D will be in the first visual column,
	 * and slots A & C will be in the second visual column.
	 * Defaults to false (A & C in first column, B & D in second).
	 */
	reverseDesktopColumns?: boolean;
	className?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({
	slotA,
	slotB,
	slotC,
	slotD,
	desktopColSpans = { col1: 1, col2: 1 },
	reverseDesktopColumns = false,
	className,
}) => {
	if (!slotA && !slotB && !slotC && !slotD) {
		return null;
	}

	const firstVisualColSpan = desktopColSpans.col1;
	const secondVisualColSpan = desktopColSpans.col2;
	const totalDesktopCols = firstVisualColSpan + secondVisualColSpan;

	const slotAShouldSpanRows = !slotC;
	const slotBShouldSpanRows = !slotD;

	const gridColsClass = `lg:grid-cols-${totalDesktopCols}`;

	const firstVisualColumn_SpanClass = `lg:col-span-${firstVisualColSpan}`;
	const firstVisualColumn_StartClass = "lg:col-start-1";

	const secondVisualColumn_SpanClass = `lg:col-span-${secondVisualColSpan}`;
	const secondVisualColumn_StartClass = `lg:col-start-${firstVisualColSpan + 1}`;

	let slotAC_finalColSpanClass: string;
	let slotAC_finalColStartClass: string;
	let slotBD_finalColSpanClass: string;
	let slotBD_finalColStartClass: string;

	if (reverseDesktopColumns) {
		slotAC_finalColSpanClass = secondVisualColumn_SpanClass;
		slotAC_finalColStartClass = secondVisualColumn_StartClass;
		slotBD_finalColSpanClass = firstVisualColumn_SpanClass;
		slotBD_finalColStartClass = firstVisualColumn_StartClass;
	} else {
		slotAC_finalColSpanClass = firstVisualColumn_SpanClass;
		slotAC_finalColStartClass = firstVisualColumn_StartClass;
		slotBD_finalColSpanClass = secondVisualColumn_SpanClass;
		slotBD_finalColStartClass = secondVisualColumn_StartClass;
	}

	return (
		<div className={cn("grid gap-6", gridColsClass, className)}>
			{/* Slot A */}
			{slotA && (
				<div
					className={cn(
						"min-w-0",
						slotAC_finalColSpanClass,
						"lg:row-start-1",
						slotAC_finalColStartClass,
						slotAShouldSpanRows && "lg:row-span-2",
					)}
				>
					{slotA}
				</div>
			)}

			{slotB && (
				<div
					className={cn(
						"min-w-0",
						slotBD_finalColSpanClass,
						"lg:row-start-1",
						slotBD_finalColStartClass,
						slotBShouldSpanRows && "lg:row-span-2",
					)}
				>
					{slotB}
				</div>
			)}

			{slotC && (
				<div
					className={cn(
						"min-w-0",
						slotAC_finalColSpanClass,
						"lg:row-start-2",
						slotAC_finalColStartClass,
					)}
				>
					{slotC}
				</div>
			)}

			{slotD && (
				<div
					className={cn(
						"min-w-0",
						slotBD_finalColSpanClass,
						"lg:row-start-2",
						slotBD_finalColStartClass,
					)}
				>
					{slotD}
				</div>
			)}
		</div>
	);
};

export default TextBlock;
