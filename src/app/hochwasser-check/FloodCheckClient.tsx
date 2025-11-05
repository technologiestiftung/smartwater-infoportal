/* eslint-disable no-nested-ternary */
"use client";
import Results from "@/components/Results";
import RiskAnalysis from "@/components/RiskAnalysis";
import { useHash } from "@/hooks/useHash";
import { Button } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import useStore from "@/store/defaultStore";
import { getHazardData } from "@/server/actions/getHazardData";
import CheckBlock from "@/components/CheckBlock";

export default function FloodCheckClient() {
	const t = useTranslations();
	const hash = useHash();
	const router = useRouter();
	const currentUserAddress = useStore((state) => state.currentUserAddress);
	const setLocationData = useStore((state) => state.setLocationData);
	const setLoadingLocationData = useStore(
		(state) => state.setLoadingLocationData,
	);
	const searchParams = useSearchParams();
	const getCheckFromURL = searchParams.get("skip") === "true";

	const checkHazard = async (skip?: boolean) => {
		if (!currentUserAddress?.lat || !currentUserAddress?.lon) {
			return;
		}
		setLoadingLocationData(true);
		try {
			const longitude = parseFloat(currentUserAddress.lon);
			const latitude = parseFloat(currentUserAddress.lat);
			const result = await getHazardData(longitude, latitude);
			setLocationData(result);
			if (skip) {
				router.push("/hochwasser-check?skip=true#results");
			} else {
				router.push("/hochwasser-check#questionnaire");
			}
		} finally {
			setLoadingLocationData(false);
		}
	};

	const submit = async () => {
		router.push("/hochwasser-check#results");
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
						<RiskAnalysis onSubmit={submit} />
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
						<h2 className="">{t("floodCheck.start.title")}</h2>
						<p className="">{t("floodCheck.start.description")}</p>
						<CheckBlock
							onSubmit={(goTo) => {
								checkHazard(goTo === "no");
							}}
						/>
					</div>
				</>
			)}
		</div>
	);
}
