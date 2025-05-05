"use client";
import { Button, Form, FormFieldWrapper, FormWrapper } from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function Home() {
	const t = useTranslations("home");
	const methods = useForm({
		defaultValues: {
			addresse: "",
		},
	});
	const property: FormProperty = {
		id: "addresse",
		name: "Addresse",
		type: "text",
		description: "Enter your full addresse",
		placeholder: "John Doe",
		isRequired: true,
	};

	const handleSubmit = () => {
		return methods.handleSubmit((data) => {
			console.warn(data);
		});
	};

	return (
		<>
			<h1 className="">{t("pageTitle")}</h1>
			<div className="Intro flex flex-col gap-6">
				<h2 className="">{t("whatIsIt.title")}</h2>
				<p className="">
					{t("whatIsIt.quote")} <br />
					{t("whatIsIt.description1")}
				</p>
				<p className="">{t("whatIsIt.description2")}</p>
			</div>
			<div className="divider" />
			<div className="HochwasserCheck flex flex-col gap-6">
				<h2 className="">{t("amIAffected.title")}</h2>
				<p className="">{t("amIAffected.description")}</p>
				<p className="">{t("amIAffected.cta")}</p>
				<FormWrapper>
					<Form {...methods}>
						<form className="flex flex-col gap-8" onSubmit={handleSubmit()}>
							<FormFieldWrapper formProperty={property} form={methods} />
							<Link href="/wasser-check">
								<Button type="submit">HochwasserCheck jetzt starten!</Button>
							</Link>
						</form>
					</Form>
				</FormWrapper>
			</div>
			<div className="Handlungsempfehlungen flex w-full flex-col gap-6 md:flex-row">
				<div className="flex w-full flex-col gap-6 md:order-1">
					<h2 className="">{t("howToProtect.title")}</h2>
					<p className="">{t("howToProtect.ownerInfo")}</p>
					<p className="">{t("howToProtect.tenantInfo")}</p>
					<p className="">{t("howToProtect.generalRule")}</p>
					<div className="hidden w-full flex-col gap-6 md:flex">
						<p className="">{t("howToProtect.recommendations.info")}</p>
						<Button className="w-full">
							{t("howToProtect.recommendations.button")}
						</Button>
					</div>
				</div>
				<div className="Image md:order-0 md:order-0 h-[385px] w-full bg-gray-200"></div>
				<div className="flex w-full flex-col gap-6 md:hidden">
					<p className="">{t("howToProtect.recommendations.info")}</p>
					<Button className="w-full">
						{t("howToProtect.recommendations.button")}
					</Button>
				</div>
			</div>
			<div className="divider" />
			<div className="Warnungen flex flex-col gap-6">
				<h2 className="">{t("floodRadar.title")}</h2>
				<h3 className="">{t("floodRadar.subtitle")}</h3>
				<div className="Widget bg-message-success flex h-[116px] w-full flex-wrap items-center justify-center">
					<span> {t("floodRadar.currentStatus.noWarnings")}</span>
				</div>
				<p className="">{t("floodRadar.description")}</p>
			</div>
			<div className="divider" />
			<div className="Handlungsempfehlungen flex w-full flex-col gap-6">
				<h2 className="">{t("backgroundInfo.title")}</h2>
				<p className="">{t("backgroundInfo.questions")}</p>
				<div className="Image h-[385px] w-full bg-gray-200"></div>
				<Link href="/allgemeine-informationen">
					<Button className="w-1/3">{t("backgroundInfo.button")}</Button>
				</Link>
			</div>
		</>
	);
}
