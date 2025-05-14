/* eslint-disable no-nested-ternary */
"use client";
import InterimResults from "@/components/InterimResults";
import RiskAnalysis from "@/components/RiskAnalysis";
import { useHash } from "@/hooks/useHash";
import { HazardLevel } from "@/lib/types";
import { Button, Form, FormWrapper, FormFieldWrapper } from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function FloodCheckClient() {
	const t = useTranslations();
	const hash = useHash();
	const router = useRouter();

	const entities = [
		{ name: "fluvialFlood", hazardLevel: "low" as HazardLevel },
		{ name: "heavyRain", hazardLevel: "high" as HazardLevel },
	];
	const methods = useForm({
		defaultValues: {
			addresse: "",
		},
	});

	const property: FormProperty = {
		id: "address",
		name: t("home.addressCheck.label"),
		type: "text",
		description: t("home.addressCheck.description"),
		placeholder: "Landstraße 1, 12345 Berlin",
		isRequired: true,
	};
	const quickCheck = async () => {
		router.push("/wasser-check#interimResult");
	};
	const submit = async () => {
		router.push("/wasser-check#floodCheck");
	};

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
						{t("common.backToStart")}
					</Button>
					<div className="flex w-full flex-col gap-2">
						<div className="flex items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
							<h1 className="">{t("floodCheck.interimResults.title")}</h1>
						</div>
						<InterimResults entities={entities} />
					</div>
				</>
			) : hash === "analysis" ? (
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
							<h1 className="">{t("floodCheck.results.title")}</h1>
						</div>
						<RiskAnalysis onSubmit={submit} />
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
						<FormWrapper>
							<Form {...methods}>
								<div className="flex w-full flex-col gap-8">
									<FormFieldWrapper
										key={property.id}
										formProperty={property}
										form={methods}
									/>

									<div className="mt-4 flex w-full flex-col space-y-4">
										<Button
											className="w-full self-start lg:w-fit"
											onClick={quickCheck}
											type="button"
										>
											{t("common.confirm")}
										</Button>
									</div>
								</div>
							</Form>
						</FormWrapper>
					</div>
				</>
			)}
		</div>
	);
}
