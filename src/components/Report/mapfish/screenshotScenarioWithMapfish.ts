import { useMapStore } from "@/lib/store/mapStore";
import { Scenario, SUBJECT_LAYER_BY_SCENARIO } from "@/types/map";
import { buildScenarioWmsSpec } from "./mapfishScenarioSpec";
import services from "@/config/services.json";

function getBasemapService() {
    const base = services.find((s) => s.id === "basemap_raster_farbe");
    if (!base) throw new Error("basemap service missing in services.json");
    if (!base.layers) throw new Error("basemap service missing 'layers' (WMS LAYERS param)");
    return base;
}

export async function screenshotScenarioWithMapfish(scenario: Scenario) {
  const state = useMapStore.getState();
  const map = state.scenarioMap[scenario];
  if (!map) throw new Error("Scenario map not initialized");

  const basemap = getBasemapService();

  const subjectLayerName = SUBJECT_LAYER_BY_SCENARIO[scenario]?.[0];
  if (!subjectLayerName) throw new Error("No subject layer for scenario");

  const spec = buildScenarioWmsSpec({
    map,
    baseWms: { url: "https://gdi.berlin.de/services/wms/", layers: basemap.layers },
    subjectWms: { url: basemap.url, layers: subjectLayerName },
  });

  const res = await fetch("/api/mapfish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appId: "default", // from your colleagues' print setup
      format: "png",
      spec,
    }),
  });

  if (!res.ok) throw new Error(await res.text());

  console.log('res /api/mapfish :>> ', res);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  return window.open(url, "_blank", "noopener,noreferrer");
  a.href = url;
  a.download = `${scenario}.png`;
  a.click();
  URL.revokeObjectURL(url);
}