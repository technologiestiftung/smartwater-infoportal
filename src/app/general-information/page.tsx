"use client";
import {
	Button,
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "berlin-ui-library";
import { useTranslations } from "next-intl";
import Link from "next/link";
export default function GeneralInformation() {
	const t = useTranslations("generalInfo");

	return (
		<div className="flex flex-col justify-start gap-6">
			<Link href="/">
				<Button variant="back-link" className="self-start">
					Zurück zur Startseite
				</Button>
			</Link>
			<div className="Intro flex flex-col gap-6">
				<h1 className="">{t("pageTitle")}</h1>
				<h2 className="">{t("definition.title")}</h2>
				<p className="">{t("definition.description")}</p>
			</div>
			<div className="divider" />

			<div className="InfoContent flex flex-col gap-6">
				<div className="flex flex-col gap-6">
					<h2 className="">{t("types.title")}</h2>
					<h3 className="">{t("types.pluvial.title")}</h3>
					<p className="">{t("types.pluvial.description")}</p>
					<h3 className="">{t("types.fluvial.title")}</h3>
					<p className="">{t("types.fluvial.description")}</p>
					<div className="Image h-[385px] w-full bg-gray-200"></div>
				</div>
				<div className="divider" />
				<div className="flex flex-col gap-6">
					<h2 className="">{t("hazardVsRisk.title")}</h2>
					<h3 className="">{t("hazardVsRisk.hazard.title")}</h3>
					<p className="">{t("hazardVsRisk.hazard.description")}</p>
					<h3 className="">{t("hazardVsRisk.risk.title")}</h3>
					<p className="">{t("hazardVsRisk.risk.description")}</p>
					<p className="">{t("hazardVsRisk.mitigation")}</p>
					<p className="">{t("hazardVsRisk.cta", { link: "LINK EINFÜGEN" })}</p>
					<div className="Image h-[385px] w-full bg-gray-200"></div>
				</div>
				<div className="divider" />
				<div className="flex flex-col gap-6">
					<h2 className="">{t("assessment.title")}</h2>
					<h3 className="">{t("assessment.how.title")}</h3>
					<p className="">{t("assessment.how.description")}</p>
					<p className="">{t("assessment.how.note")}</p>
					<p className="">{t("assessment.how.note2")}</p>
					<div className="Image h-[385px] w-full bg-gray-200"></div>
					<p className="">{t("assessment.distribution.description")}</p>
					<ul className="list-disc pl-6">
						<li>{t("assessment.distribution.linkPluvial")}</li>
						<li>{t("assessment.distribution.linkFluvial")}</li>
					</ul>
				</div>
				<div className="divider" />
				<div className="flex flex-col gap-6">
					<h2 className="">{t("furtherInformation.sectionTitle")}</h2>
					<Accordion type="single" collapsible variant="default">
						<AccordionItem value="item1" variant="default">
							<AccordionTrigger variant="default">
								<h4> {t("furtherInformation.item1.title")}</h4>
							</AccordionTrigger>
							<AccordionContent variant="default">
								<p>{t("furtherInformation.item1.content")}</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item2" variant="default">
							<AccordionTrigger variant="default">
								<h4> {t("furtherInformation.item2.title")}</h4>
							</AccordionTrigger>
							<AccordionContent variant="default">
								<p>{t("furtherInformation.item1.content")}</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item3" variant="default">
							<AccordionTrigger variant="default">
								<h4> {t("furtherInformation.item3.title")}</h4>
							</AccordionTrigger>
							<AccordionContent variant="default">
								<p>{t("furtherInformation.item1.content")}</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</div>
		</div>
	);
}
