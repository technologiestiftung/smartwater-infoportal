/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import ScenarioMap from "@/components/ScenarioMap/Map";
import type { Scenario } from "@/types/map";

declare global {
	interface Window {
		__SCENARIO_INPUT__?: {
			buildingGeometry: any;
			outlineBufferGeometry: any;
		};
		__SET_SCENARIO__?: (s: Scenario) => void;
		__SCREENSHOT_READY__?: boolean;
	}
}

export default function ScenarioMapRunnerClient() {
	const [scenario, setScenario] = useState<Scenario>("SR" as Scenario);

	useEffect(() => {
		window.__SCREENSHOT_READY__ = false;

		window.__SET_SCENARIO__ = (s: Scenario) => {
			window.__SCREENSHOT_READY__ = false;
			setScenario(s);
		};

		return () => {
			delete window.__SET_SCENARIO__;
		};
	}, []);

	return (
		<div style={{ background: "white" }}>
			<div id="map-host">
				<ScenarioMap scenario={scenario} />
			</div>
		</div>
	);
}
