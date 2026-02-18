/* eslint-disable no-nested-ternary */
"use client";
import CheckBlock from "@/components/CheckBlock";
import Results from "@/components/Results";
import RiskAnalysis from "@/components/RiskAnalysis";
import { useHash } from "@/hooks/useHash";
import { getHazardData } from "@/server/actions/getHazardData";
import useStore from "@/store/defaultStore";
import { Button } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function FloodCheckClient() {
	const t = useTranslations();
	const hash = useHash();
	const router = useRouter();
	const { currentUserAddress, setLocationData } = useStore();
	const searchParams = useSearchParams();
	const getCheckFromURL = searchParams.get("skip") === "true";

	const checkHazard = async (skip?: boolean) => {
		if (!currentUserAddress?.lat || !currentUserAddress?.lon) {
			return;
		}
		try {
			const longitude = parseFloat(currentUserAddress.lon);
			const latitude = parseFloat(currentUserAddress.lat);
			const result = await getHazardData(longitude, latitude);
			console.log("setLocationData ✅✅✅");
			setLocationData(result);
			if (skip) {
				router.push("/hochwasser-check?skip=true#results");
			} else {
				router.push("/hochwasser-check#questionnaire");
			}
		} catch (error) {
			console.error("Error in checkHazard function:", error);
		}
	};

	useEffect(() => {
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
						<p className="">
							{t.rich("floodCheck.start.backgroundInfo", {
								link: (chunks) => (
									<Link
										href="/hintergrund-informationen"
										className="text-text-link underline"
									>
										{chunks}
									</Link>
								),
							})}
						</p>

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
