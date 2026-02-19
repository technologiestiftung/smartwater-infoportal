// mapfishScenarioSpec.ts
import type Map from "ol/Map";

const INCHES_PER_METER = 39.37;

function resolutionToScale(resolution: number, dpi: number) {
  // EPSG:25833 is meters, so metersPerUnit = 1
  return resolution * dpi * INCHES_PER_METER;
}

function snapScale(scale: number, allowed: number[]) {
  let best = allowed[0];
  let bestDiff = Math.abs(scale - best);
  for (const s of allowed) {
    const d = Math.abs(scale - s);
    if (d < bestDiff) { best = s; bestDiff = d; }
  }
  return best;
}

export function buildScenarioWmsSpec(params: {
  map: Map;
  baseWms: { url: string; layers: string | string[] };
  subjectWms: { url: string; layers: string | string[] };
  dpi?: number;
  width?: number;
  height?: number;
}) {
  const { map } = params;
  const view = map.getView();

  const center = view.getCenter();
  const projection = view.getProjection().getCode();
  const resolution = view.getResolution();

  if (!center || !resolution) throw new Error("Map view not ready");

  const dpi = params.dpi ?? 90;
  const width = params.width ?? 780;
  const height = params.height ?? 660;

  const approxScale = resolutionToScale(resolution, dpi);

  // match your mapfish config.yaml zoomLevels.scales
  const allowedScales = [250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const scale = snapScale(approxScale, allowedScales);

  const toLayerArray = (v: string | string[]) =>
    Array.isArray(v) ? v : String(v).split(",").map((s) => s.trim()).filter(Boolean);

  return {
    layout: "plain",
    outputFormat: "png",
    attributes: {
      map: {
        dpi,
        projection,
        width,
        height,
        center,
        scale,
        layers: [
          {
            type: "tiledwms",
            baseURL: params.baseWms.url,
            layers: toLayerArray(params.baseWms.layers),
            imageFormat: "image/png",
            opacity: 1,
            customParams: { TRANSPARENT: true },
            tileSize: [256, 256],
          },
          {
            type: "tiledwms",
            baseURL: params.subjectWms.url,
            layers: toLayerArray(params.subjectWms.layers),
            imageFormat: "image/png",
            opacity: 1,
            customParams: { TRANSPARENT: true },
            tileSize: [256, 256],
          },
        ],
      },
    },
  };
}