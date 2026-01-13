import { useEffect, useMemo, useState } from "react";
import type Map from "ol/Map";
import { useMapStore } from "@/lib/store/mapStore";
import { ScenarioList } from "@/types/map";

function useScenarioMapsLoading(): boolean {
	const scenarioMap = useMapStore((s) => s.scenarioMap);

	const maps = useMemo(() => {
		return ScenarioList.map((scenario) => scenarioMap[scenario]).filter(
			(m): m is Map => Boolean(m),
		);
	}, [scenarioMap]);

	const [loadingCount, setLoadingCount] = useState<number | null>(null);

	useEffect(() => {
		let count = 0;
		const bump = (delta: number) => {
			count = Math.max(0, count + delta);
			setLoadingCount(count);
		};

		const cleanups = maps.map((map) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const sources: any[] = [];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			map.getLayers().forEach((layer: any) => {
				const src = layer?.getSource?.();
				if (src) {
					sources.push(src);
				}
			});

			const unsubs = sources.map((src) => {
				if (!src?.on || !src?.un) {
					return () => {};
				}

				const start = () => bump(+1);
				const end = () => bump(-1);
				const error = () => bump(-1);

				src.on("tileloadstart", start);
				src.on("tileloadend", end);
				src.on("tileloaderror", error);
				src.on("imageloadstart", start);
				src.on("imageloadend", end);
				src.on("imageloaderror", error);

				return () => {
					src.un("tileloadstart", start);
					src.un("tileloadend", end);
					src.un("tileloaderror", error);
					src.un("imageloadstart", start);
					src.un("imageloadend", end);
					src.un("imageloaderror", error);
				};
			});

			return () => unsubs.forEach((fn) => fn());
		});

		return () => cleanups.forEach((fn) => fn());
	}, [maps]);

	// true = all done (matches your current return meaning)
	return loadingCount === 0;
}

export default useScenarioMapsLoading;
