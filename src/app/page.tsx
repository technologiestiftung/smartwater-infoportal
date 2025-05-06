"use client";
import {
	Button,
	Form,
	FormFieldWrapper,
	FormWrapper,
	ImageComponent,
} from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Home() {
	const t = useTranslations("home");
	const router = useRouter();
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
		<div className="flex w-full flex-col gap-12">
			<section className="Intro flex flex-col gap-6">
				<h1 className="">{t("pageTitle")}</h1>

				<h2 className="">{t("whatIsIt.title")}</h2>
				<p className="">
					{t("whatIsIt.quote")} <br />
					{t("whatIsIt.description1")}
				</p>
				<p className="">{t("whatIsIt.description2")}</p>
			</section>
			<div className="divider" />
			<section className="HochwasserCheck-root flex flex-col gap-6">
				<h2 className="">{t("amIAffected.title")}</h2>
				<p className="">{t("amIAffected.description")}</p>
				<p className="">{t("amIAffected.cta")}</p>
				<FormWrapper>
					<Form {...methods}>
						<form className="flex flex-col gap-8" onSubmit={handleSubmit()}>
							<FormFieldWrapper formProperty={property} form={methods} />
							<Button
								onClick={() => {
									router.push("/wasser-check");
								}}
								type="submit"
							>
								{t("addressCheck.button")}
							</Button>
						</form>
					</Form>
				</FormWrapper>
			</section>
			<section className="Handlungsempfehlungen grid w-full gap-6 md:grid-cols-2">
				<div className="flex w-full flex-col gap-8 md:order-1 md:gap-10">
					<h2 className="">{t("howToProtect.title")}</h2>
					<p className="">{t("howToProtect.ownerInfo")}</p>
					<p className="">{t("howToProtect.tenantInfo")}</p>
					<p className="">{t("howToProtect.generalRule")}</p>
					<div className="hidden w-full flex-col gap-6 md:flex">
						<p className="">{t("howToProtect.recommendations.info")}</p>
						<Button
							className="w-full"
							onClick={() => {
								router.push("/handlungsempfehlungen");
							}}
						>
							{t("howToProtect.recommendations.button")}
						</Button>
					</div>
				</div>
				<ImageComponent
					src="/imagery.png"
					alt={t("howToProtect.image.alt")}
					className="w-full"
					caption={t("howToProtect.image.caption")}
					copyright={t("howToProtect.image.copyright")}
				/>
				<div className="flex w-full flex-col gap-6 md:hidden">
					<p className="">{t("howToProtect.recommendations.info")}</p>
					<Button
						onClick={() => {
							router.push("/handlungsempfehlungen");
						}}
					>
						{t("howToProtect.recommendations.button")}
					</Button>
				</div>
			</section>
			<div className="divider" />
			<section className="grid gap-6 md:grid-cols-3">
				<div className="order-1 flex flex-col gap-6 md:order-1 md:col-span-2">
					<h2 className="">{t("floodRadar.title")}</h2>
					<h3 className="">{t("floodRadar.subtitle")}</h3>
					<p className="hidden md:block">{t("floodRadar.description")}</p>
				</div>
				<div className="Widget bg-message-success order-2 m-2 flex h-96 w-full flex-wrap items-center justify-center md:order-2 md:h-full">
					<span> {t("floodRadar.currentStatus.noWarnings")}</span>
				</div>
				<p className="order-3 block md:hidden">{t("floodRadar.description")}</p>
			</section>
			<div className="divider" />
			<section className="grid w-full gap-6 md:grid-cols-2">
				<div className="order-1 flex flex-col gap-8 md:order-2">
					<h2 className="">{t("backgroundInfo.title")}</h2>
					<p className="">{t("backgroundInfo.questions")}</p>
					<p className="">{t("backgroundInfo.answer")}</p>
					<div className="hidden w-full flex-col gap-6 md:flex">
						<Button
							onClick={() => {
								router.push("/allgemeine-informationen");
							}}
							className=""
						>
							{t("backgroundInfo.button")}
						</Button>
					</div>
				</div>
				<ImageComponent
					src="/imagery.png"
					alt={t("howToProtect.image.alt")}
					className="order-2 w-full md:order-1"
					caption={t("howToProtect.image.caption")}
					copyright={t("howToProtect.image.copyright")}
				/>
				<div className="order-3 flex w-full flex-col gap-6 md:hidden">
					<Button
						onClick={() => {
							router.push("/allgemeine-informationen");
						}}
						className=""
					>
						{t("backgroundInfo.button")}
					</Button>
				</div>
			</section>
		</div>
	);
}
