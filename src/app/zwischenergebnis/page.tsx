"use client";
import InterimResults, { HazardLevel } from "@/components/InterimResults";
import { Button } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function CheckResults() {
	const t = useTranslations();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [harzardLevel, setHazardLevel] = useState("low");

	return (
		<div className="flex w-full flex-col justify-start gap-6">
			<Link href="/wasser-check">
				<Button variant="back-link" className="self-start">
					{t("common.backToStart")}
				</Button>
			</Link>
			<div className="flex w-full flex-col gap-2">
				<h1 className="">{t("checkResults.pageTitle")}</h1>
				<InterimResults
					subtitle={t("checkResults.hazardSummary.low")}
					harzardLevel={harzardLevel as HazardLevel}
				/>
			</div>
			<div className="flex w-full flex-col gap-6">
				<p className="">{t("checkResults.dataSourceInfo")}</p>
				<p className="">{t("checkResults.eventRarityInfo")}</p>
			</div>
		</div>
	);
}
