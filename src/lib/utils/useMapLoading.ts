/* eslint-disable */
import { useEffect, useState } from "react";
import OLMap from "ol/Map";
import BaseLayer from "ol/layer/Base";
import LayerGroup from "ol/layer/Group";
import Collection from "ol/Collection";
import Source from "ol/source/Source";
import TileSource from "ol/source/Tile";
import ImageSource from "ol/source/Image";
import VectorSource from "ol/source/Vector";

type Unsub = () => void;

export function useMapLoading(map: OLMap | null) {
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!map) return;

		// Use the JS Map<K,V>, not ol/Map
		const inflight = new globalThis.Map<Source, number>();

		const addInflight = (s: Source) =>
			inflight.set(s, (inflight.get(s) || 0) + 1);
		const subInflight = (s: Source) =>
			inflight.set(s, Math.max(0, (inflight.get(s) || 0) - 1));
		const totalInflight = () =>
			Array.from(inflight.values()).reduce((a, b) => a + b, 0);

		let moving = false;
		let offTimer: ReturnType<typeof setTimeout> | null = null;

		const ensureOn = () => {
			if (!loading) setLoading(true);
			if (offTimer) {
				clearTimeout(offTimer);
				offTimer = null;
			}
		};

		const maybeOffSoon = () => {
			// Wait a tick so render completes and cached loads stabilize
			if (offTimer) clearTimeout(offTimer);
			offTimer = setTimeout(() => {
				if (!moving && totalInflight() === 0) setLoading(false);
			}, 150); // tweak if needed
		};

		// ---- Map view motion ----
		const onMoveStart = () => {
			moving = true;
			ensureOn();
		};
		const onMoveEnd = () => {
			moving = false;
			maybeOffSoon();
		};
		const onRenderComplete = () => {
			// Called every frame; only turn off if no loads pending
			maybeOffSoon();
		};

		map.on("movestart", onMoveStart);
		map.on("moveend", onMoveEnd);
		map.on("rendercomplete" as any, onRenderComplete);

		const unsubs: Unsub[] = [];

		// Bind / unbind events for a single source
		const bindSource = (src?: Source | null) => {
			if (!src) return;

			const inc = () => {
				addInflight(src);
				ensureOn();
			};
			const dec = () => {
				subInflight(src);
				maybeOffSoon();
			};

			if (src instanceof TileSource) {
				src.on("tileloadstart", inc);
				src.on("tileloadend", dec);
				src.on("tileloaderror", dec);
				unsubs.push(() => {
					src.un("tileloadstart", inc);
					src.un("tileloadend", dec);
					src.un("tileloaderror", dec);
				});
			} else if (src instanceof ImageSource) {
				src.on("imageloadstart", inc);
				src.on("imageloadend", dec);
				src.on("imageloaderror", dec);
				unsubs.push(() => {
					src.un("imageloadstart", inc);
					src.un("imageloadend", dec);
					src.un("imageloaderror", dec);
				});
			} else if (src instanceof VectorSource) {
				// WFS/Vector: featuresload* are emitted on network requests
				const s = src as unknown as {
					on: (t: string, cb: () => void) => void;
					un: (t: string, cb: () => void) => void;
				};
				const start = () => inc();
				const end = () => dec();
				s.on("featuresloadstart", start);
				s.on("featuresloadend", end);
				s.on("featuresloaderror", end);
				unsubs.push(() => {
					s.un("featuresloadstart", start);
					s.un("featuresloadend", end);
					s.un("featuresloaderror", end);
				});
				// If the vector already has features (cache), schedule an off check
				if (src.getFeatures && src.getFeatures().length > 0) maybeOffSoon();
			}
		};

		// Bind a layer (and react to its source changing)
		const bindLayer = (layer: BaseLayer) => {
			const getSource = (layer as any).getSource?.bind(layer) as
				| (() => Source | null)
				| undefined;
			if (getSource) bindSource(getSource());

			const onSrcChange = () => {
				bindSource((layer as any).getSource?.());
			};
			// @ts-expect-error event name exists at runtime
			layer.on?.("change:source", onSrcChange);
			unsubs.push(() => layer.un?.("change", onSrcChange));

			// If it's a group, watch its collection
			if (layer instanceof LayerGroup) {
				const coll: Collection<BaseLayer> = layer.getLayers();
				const add = (e: any) => bindLayer(e.element as BaseLayer);
				const rem = (_: any) => maybeOffSoon();
				coll.on("add", add);
				coll.on("remove", rem);
				unsubs.push(() => {
					coll.un("add", add);
					coll.un("remove", rem);
				});
				coll.forEach((l) => bindLayer(l));
			}
		};

		// Bind existing top-level layers and watch for new ones
		const top = map.getLayers();
		const onAdd = (e: any) => bindLayer(e.element as BaseLayer);
		const onRemove = (_: any) => maybeOffSoon();
		top.on("add", onAdd);
		top.on("remove", onRemove);
		unsubs.push(() => {
			top.un("add", onAdd);
			top.un("remove", onRemove);
		});
		top.forEach((l) => bindLayer(l));

		// Initial state: if nothing is moving/loading, ensure spinner is off
		maybeOffSoon();

		return () => {
			if (offTimer) clearTimeout(offTimer);
			map.un("movestart", onMoveStart);
			map.un("moveend", onMoveEnd);
			map.un("rendercomplete" as any, onRenderComplete);
			unsubs.forEach((u) => u());
		};
	}, [map, loading]);

	return loading;
}
