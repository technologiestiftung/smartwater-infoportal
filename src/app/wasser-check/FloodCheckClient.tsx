/* eslint-disable no-nested-ternary */
"use client";
import InterimResults from "@/components/InterimResults";
import Results from "@/components/Results";
import RiskAnalysis from "@/components/RiskAnalysis";
import { useHash } from "@/hooks/useHash";
import { HazardLevel } from "@/lib/types";
import { Button, Form, FormWrapper, FormFieldWrapper } from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import Link from "next/link";
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
		router.push("/wasser-check#results");
	};

	return (
		<div className="flex w-full flex-col justify-start gap-6">
			{hash === "interimResult" ? (
				<>
					<Link href="/wasser-check">
						<Button variant="back-link" className="self-start">
							{t("common.backToStart")}
						</Button>
					</Link>
					<div className="flex w-full flex-col gap-2">
						<div className="flex items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
							<h1 className="">{t("floodCheck.interimResults.title")}</h1>
						</div>
						<InterimResults entities={entities} />
					</div>
				</>
			) : hash === "questionnaire" ? (
				<>
					<Link href="/wasser-check#interimResult">
						<Button variant="back-link" className="self-start">
							{t("floodCheck.navigation.back")}
						</Button>
					</Link>
					<div className="flex w-full flex-col gap-4">
						<div className="flex items-center space-x-2">
							<h1 className="">{t("floodCheck.pageTitle")}</h1>
						</div>
						<RiskAnalysis onSubmit={submit} />
					</div>
				</>
			) : hash === "results" ? (
				<>
					<Link href="/wasser-check#questionnaire">
						<Button variant="back-link" className="self-start">
							{t("floodCheck.results.navigation.back")}
						</Button>
					</Link>
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
											onClick={quickCheck}
											type="button"
											className="item text-left"
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
