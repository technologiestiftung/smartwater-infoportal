/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import RiskBlock from "@/components/RiskBlock";

export default function RiskblockClient() {
	const [payload, setPayload] = useState<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// @ts-expect-error puppeteer injects this global at runtime
		const p = window.__SCREENSHOT_INPUT__ ?? null;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPayload(p);
		setTimeout(() => {
			const height = containerRef.current?.getBoundingClientRect().height ?? 0;
			console.log("height RiskBlock :>> ", height);
			// @ts-expect-error puppeteer injects this global at runtime
			window.__SCREENSHOT_READY__ = {
				ready: Boolean(p),
				height,
			};
		}, 1500);
	}, []);

	if (
		!payload?.floodRiskResultDown ||
		!payload?.floodRiskAnswersDown ||
		!payload?.hazardEntitiesDown
	) {
		return <div className="p-8">Missing payload</div>;
	}

	return (
		<div ref={containerRef}>
			<RiskBlock
				floodRiskResultDown={payload.floodRiskResultDown}
				floodRiskAnswersDown={payload.floodRiskAnswersDown}
				hazardEntitiesDown={payload.hazardEntitiesDown}
			/>
		</div>
	);
}
