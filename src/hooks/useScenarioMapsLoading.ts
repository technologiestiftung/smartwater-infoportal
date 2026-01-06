/* eslint-disable react-hooks/rules-of-hooks */

import { useMapStore } from "@/lib/store/mapStore";
import { useMapLoading } from "@/lib/utils/useMapLoading";
import { Scenario } from "@/types/map";

function useScenarioMapsLoading(
	scenarios: Scenario[],
	initial = false,
): boolean {
	const scenarioMaps = useMapStore((s) => s.scenarioMap);

	const loadingStates = scenarios.map((scenario) =>
		useMapLoading(scenarioMaps[scenario] ?? null, initial),
	);

	return loadingStates.every((l) => l === false);
}

export default useScenarioMapsLoading;
