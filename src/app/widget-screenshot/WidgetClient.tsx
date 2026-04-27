/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ResultBlock from "@/components/ResultBlock";
import { useEffect, useState } from "react";

export default function WidgetClient() {
	const [payload, setPayload] = useState<any>(null);

	useEffect(() => {
		// @ts-expect-error puppeteer injects this global at runtime
		const p = window.__SCREENSHOT_INPUT__ ?? null;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPayload(p);

		// @ts-expect-error puppeteer readiness flag set dynamically
		window.__SCREENSHOT_READY__ = Boolean(p);
	}, []);

	if (!payload?.hazardEntity) {
		return <div className="p-8">Missing payload</div>;
	}

	return (
		<div className="w-100">
			<ResultBlock
				key={payload.hazardEntity.name}
				entity={payload.hazardEntity.name}
				hazardLevel={payload.hazardEntity.hazardLevel}
				showSubLabel={payload.hazardEntity.showSubLabel || false}
				subHazardLevel={payload.hazardEntity.subHazardLevel}
			/>
		</div>
	);
}
