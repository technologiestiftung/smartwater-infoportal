/* eslint-disable no-nested-ternary */
"use client";
import InterimResults from "@/components/InterimResults";
import Results from "@/components/Results";
import RiskAnalysis from "@/components/RiskAnalysis";
import { useHash } from "@/hooks/useHash";
import { Button } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import AddressSearch from "../../components/AddressSearch";
import { useEffect } from "react";
import useStore from "@/store/defaultStore";
import { getHazardData } from "@/server/actions/getHazardData";

export default function FloodCheckClient() {
	const t = useTranslations();
	const hash = useHash();
	const router = useRouter();
	const currentUserAddress = useStore((state) => state.currentUserAddress);
	const setHazardData = useStore((state) => state.setHazardData);
	const setLoadingHazardData = useStore((state) => state.setLoadingHazardData);

	const checkHazard = async () => {
		if (!currentUserAddress?.lat || !currentUserAddress?.lon) {
			return;
		}

		setLoadingHazardData(true);
		try {
			const longitude = parseFloat(currentUserAddress.lon);
			const latitude = parseFloat(currentUserAddress.lat);
			const result = await getHazardData(longitude, latitude);
			setHazardData(result);
			router.push("/wasser-check#interimResult");
		} finally {
			setLoadingHazardData(false);
		}
	};

	const submit = async () => {
		router.push("/wasser-check#results");
	};

	useEffect(() => {
		// eslint-disable-next-line no-extra-boolean-cast
		if (!!hash) {
			window.scrollTo(0, 0);
		}
	}, [hash]);

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
			{hash === "interimResult" ? (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() => {
							router.push("/wasser-check");
						}}
						variant="back-link"
					>
						{t("common.backToAddressSearch")}
					</Button>
					<div className="flex w-full flex-col gap-2">
						<div className="flex items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
							<h1 className="">{t("floodCheck.interimResults.title")}</h1>
						</div>
						<InterimResults />
					</div>
				</>
			) : hash === "questionnaire" ? (
				<>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						onClick={() => {
							router.push("/wasser-check#interimResult");
						}}
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
						onClick={() => {
							router.push("/wasser-check#questionnaire");
						}}
						variant="back-link"
					>
						{t("floodCheck.results.navigation.back")}
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
						<AddressSearch onAddressConfirmed={checkHazard} />
					</div>
				</>
			)}
		</div>
	);
}
