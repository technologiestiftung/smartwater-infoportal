/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Results from "@/components/Results";
import RiskAnalysis from "@/components/RiskAnalysis";
import { useHash } from "@/hooks/useHash";
import { Button } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import useStore from "@/store/defaultStore";
import { getHazardData } from "@/server/actions/getHazardData";
import CheckBlock from "@/components/CheckBlock";
import { ScenarioList, Scenario } from "@/types/map";
import { getScenarioDomId } from "@/lib/utils/mapUtils";

export default function FloodCheckClient() {
	const t = useTranslations();
	const hash = useHash();
	const router = useRouter();
	const { currentUserAddress, setLocationData, setImage, clearPDFImages } =
		useStore();
	const searchParams = useSearchParams();
	const getCheckFromURL = searchParams.get("skip") === "true";
	const makePDFImagesInitializedRef = useRef<boolean>(false);

	const getLocationDataAndStartPDFImageFetch = async () => {
		if (!currentUserAddress?.lat || !currentUserAddress?.lon) {
			return;
		}
		try {
			clearPDFImages();
			const longitude = parseFloat(currentUserAddress.lon);
			const latitude = parseFloat(currentUserAddress.lat);
			const result = await getHazardData(longitude, latitude);
			setLocationData(result);
			if (!result.found) {
				return;
			}
			const locationData = result;
			for (const scenario of ScenarioList) {
				const path = `/scenario-map?scenario=${scenario}`;
				const key: string = getScenarioDomId(scenario as Scenario);
				const body: {
					url: string;
					buildingGeometry?: any;
					outlineBufferGeometry?: any;
				} = {
					url: `${window.location.origin}${path}`,
					buildingGeometry: locationData?.building?.geometry,
					outlineBufferGeometry: locationData?.building?.outlineBufferGeometry,
				};

				const res = await fetch("/api/screenshot", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});

				const text = await res.text();

				if (!res.ok) {
					throw new Error(`Screenshot API failed (${res.status}): ${text}`);
				}

				const data = JSON.parse(text);
				const { imageBase64 } = data;
				const dataUrl = `data:image/jpeg;base64,${imageBase64}`;
				const blob = await fetch(dataUrl).then((r) => r.blob());
				setImage(`${key}`, blob);
			}
		} catch (error) {
			console.error("Error capturing scenario map screenshot:", error);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line no-extra-boolean-cast
		if (!!hash) {
			window.scrollTo(0, 0);
		}
	}, [hash]);

	useEffect(() => {
		if (!hash) {
			const check = useStore.getState().currentUserAddress;
			if (!check) {
				router.push("/#hochwasser-check");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hash]);

	useEffect(() => {
		if (makePDFImagesInitializedRef.current) {
			return;
		}
		makePDFImagesInitializedRef.current = true;
		getLocationDataAndStartPDFImageFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
			{hash === "questionnaire" ? (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() => router.push("/hochwasser-check")}
						variant="back-link"
					>
						{t("floodCheck.navigation.back")}
					</Button>
					<div className="flex w-full flex-col gap-4">
						<div className="flex items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
						</div>
						<RiskAnalysis />
					</div>
				</>
			) : hash === "results" ? (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() =>
							router.push(
								getCheckFromURL
									? "/hochwasser-check"
									: "/hochwasser-check#questionnaire",
							)
						}
						variant="back-link"
					>
						{getCheckFromURL
							? t("floodCheck.results.navigation.back")
							: t("floodCheck.results.navigation.backQuestionnaire")}
					</Button>
					<div className="flex w-full flex-col gap-4">
						<div className="flex flex-wrap items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
							<h1 className="">{t("floodCheck.results.title")}</h1>
							<Results />
						</div>
					</div>
				</>
			) : (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() => {
							router.push("/");
						}}
						variant="back-link"
					>
						{t("common.backToStart")}
					</Button>
					<div className="flex w-full flex-col gap-4">
						<h1 className="">{t("floodCheck.pageTitle")}</h1>
						<p className="">{t("floodCheck.start.description")}</p>
						<CheckBlock
							onSubmit={(goTo) => {
								const skip = goTo === "no";
								if (skip) {
									router.push("/hochwasser-check?skip=true#results");
								} else {
									router.push("/hochwasser-check#questionnaire");
								}
							}}
						/>
					</div>
				</>
			)}
		</div>
	);
}
