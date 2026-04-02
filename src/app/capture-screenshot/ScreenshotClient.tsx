"use client";
import ResultBlock from "@/components/ResultBlock";
import RiskBlock from "@/components/RiskBlock";
import ScenarioMap from "@/components/ScenarioMap/Map";
import { cn } from "@/lib/utils";
import { Scenario } from "@/types/map";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function WidgetsClient() {
	const [payload, setPayload] = useState<any>(null);

	useEffect(() => {
		// @ts-expect-error puppeteer injects this global at runtime
		const p = window.__SCREENSHOT_INPUT__ ?? null;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPayload(p);
	}, []);

	if (!payload) return <div className="p-8">Missing payload</div>;

	return (
		<div className="flex w-[1140px] flex-col">
			{payload.scenarios.map((s: Scenario) => (
				<ScenarioMap key={s} scenario={s} />
			))}
			{payload.hazardEntitiesDown.map((result: any) => (
				<div
					key={result.name}
					className={cn(
						"w-[400px] shrink-0",
						result.name === "heavyRain" ? "h-[300px]" : "h-[380px]",
					)}
				>
					<ResultBlock
						entity={result.name}
						hazardLevel={result.hazardLevel}
						showSubLabel={result.showSubLabel || false}
						subHazardLevel={result.subHazardLevel}
					/>
				</div>
			))}
			{payload.floodRiskResultDown && (
				<div className="w-[400px] shrink-0">
					<RiskBlock
						floodRiskResultDown={payload.floodRiskResultDown}
						floodRiskAnswersDown={payload.floodRiskAnswersDown}
						hazardEntitiesDown={payload.hazardEntitiesDown}
					/>
				</div>
			)}
		</div>
	);
}
