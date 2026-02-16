/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import RiskBlock from "@/components/RiskBlock";

export default function RiskblockClient() {
	const [payload, setPayload] = useState<any>(null);

	useEffect(() => {
		// @ts-expect-error puppeteer injects this global at runtime
		const p = window.__RISKBLOCK_INPUT__ ?? null;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPayload(p);

		// @ts-expect-error puppeteer readiness flag set dynamically
		window.__SCREENSHOT_READY__ = Boolean(p);
	}, []);

	if (
		!payload?.floodRiskResultDown ||
		!payload?.floodRiskAnswersDown ||
		!payload?.hazardEntitiesDown
	) {
		return <div className="p-8">Missing payload</div>;
	}

	return (
		<RiskBlock
			floodRiskResultDown={payload.floodRiskResultDown}
			floodRiskAnswersDown={payload.floodRiskAnswersDown}
			hazardEntitiesDown={payload.hazardEntitiesDown}
		/>
	);
}
