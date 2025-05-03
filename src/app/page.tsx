"use client";
import {
	Button,
	Footer,
	Form,
	FormFieldWrapper,
	FormWrapper,
	Header,
} from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
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
			<Header />
			<div className="grid flex-grow justify-center">
				<main className="container flex flex-col items-start gap-6 p-8 text-left">
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
									<Button type="submit">HochwasserCheck jetzt starten!</Button>
								</form>
							</Form>
						</FormWrapper>
					</div>
					<div className="Handlungsempfehlungen flex flex-col gap-6">
						<h2 className="">{t("howToProtect.title")}</h2>
						<p className="">{t("howToProtect.ownerInfo")}</p>
						<p className="">{t("howToProtect.tenantInfo")}</p>
						<p className="">{t("howToProtect.generalRule")}</p>
						<div className="Image h-[385px] w-full bg-gray-200"></div>
						<p className="">{t("howToProtect.recommendations.info")}</p>
						<Button className="w-full">
							{t("howToProtect.recommendations.button")}
						</Button>
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
					<div className="Handlungsempfehlungen flex flex-col gap-6">
						<h2 className="">{t("backgroundInfo.title")}</h2>
						<p className="">{t("backgroundInfo.questions")}</p>
						<div className="Image h-[385px] w-full bg-gray-200"></div>
						<Button className="w-full">{t("backgroundInfo.button")}</Button>
					</div>
				</main>
				<Footer
					footerColumns={[
						{
							links: [
								{
									href: "/about-project/",
									label: "About the Project",
								},
								{
									href: "/imprint/",
									label: "Imprint",
								},
								{
									href: "/privacy-note/",
									label: "Privacy Policy",
								},
								{
									href: "/accessibility-statement/",
									label: "Accessibility Statement",
								},
							],
							title: "About",
						},
						{
							links: [
								{
									href: "/all-offers/",
									label: "All Offers",
								},
								{
									href: "/all-offers/?category=kultur",
									label: "Culture",
								},
								{
									href: "/all-offers/?category=sport",
									label: "Sports",
								},
								{
									href: "/all-offers/?category=bildung_beratung",
									label: "Education",
								},
								{
									href: "/all-offers/?category=freizeit",
									label: "Leisure",
								},
								{
									href: "/map/",
									label: "Map",
								},
							],
							title: "Content Categories",
						},
						{
							isDefaultOpen: true,
							links: [
								{
									href: "https://www.facebook.com/BerlinDE/",
									label: "Facebook",
								},
								{
									href: "https://www.instagram.com/berlinde/",
									label: "Instagram",
								},
							],
							title: "Social Media",
						},
					]}
					language="de"
					showScrollToTop
					translations={{
						de: {
							About: "Über uns",
							"About the Project": "Über das Projekt",
							"Accessibility Statement": "Barrierefreiheit",
							"All Offers": "Alle Angebote",
							"Content Categories": "Inhaltskategorien",
							Culture: "Kultur",
							Education: "Bildung & Beratung",
							Facebook: "Facebook",
							Imprint: "Impressum",
							Instagram: "Instagram",
							Leisure: "Freizeit",
							Map: "Karte",
							"Privacy Policy": "Datenschutz",
							"Social Media": "Soziale Medien",
							Sports: "Sport",
							toTheTop: "Zum Seitenanfang",
						},
						en: {
							toTheTop: "Back to top",
						},
					}}
				/>
			</div>
		</>
	);
}
