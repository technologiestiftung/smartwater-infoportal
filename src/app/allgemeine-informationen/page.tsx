"use client";
import TextBlock from "@/components/TextBlock";
import Link from "next/link";
import {
	Button,
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
	Image,
} from "berlin-ui-library";
import { useTranslations } from "next-intl";
export default function GeneralInformation() {
	const t = useTranslations();
	return (
		<div className="flex flex-col justify-start gap-12 px-5 py-8 lg:px-0">
			<section className="flex flex-col gap-6">
				<h1 className="">{t("generalInfo.pageTitle")}</h1>
				<h2 className="">{t("generalInfo.definition.title")}</h2>
				<p className="">{t("generalInfo.definition.description")}</p>
			</section>
			<div className="divider" />
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("generalInfo.types.title")}</h2>
							<h3 className="">{t("generalInfo.types.pluvial.title")}</h3>
							<p className="">{t("generalInfo.types.pluvial.description")}</p>
							<h3 className="">{t("generalInfo.types.fluvial.title")}</h3>
							<p className="">{t("generalInfo.types.fluvial.description")}</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/24_SENMVKU_Starkregen_Pluvial-Fluvial-06.png"
							alt={t("generalInfo.types.fluvial.image.alt")}
							caption={t("generalInfo.types.fluvial.image.caption")}
							copyright={t("generalInfo.types.fluvial.image.copyright")}
						/>
					}
				/>
			</section>
			<div className="divider" />
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 3, col2: 2 }}
					className="w-full gap-6"
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("generalInfo.hazardVsRisk.title")}</h2>
							<h3 className="">{t("generalInfo.hazardVsRisk.hazard.title")}</h3>
							<p className="">
								{t("generalInfo.hazardVsRisk.hazard.description")}
							</p>
							<h3 className="">{t("generalInfo.hazardVsRisk.risk.title")}</h3>
							<p className="">
								{t("generalInfo.hazardVsRisk.risk.description")}
							</p>
							<p className="">{t("generalInfo.hazardVsRisk.mitigation")}</p>
							<p className="">
								{t("generalInfo.hazardVsRisk.cta")}
								<br />
								<Link
									href="/handlungsempfehlungen"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button variant="linkWithIcon">Handlungsempfehlungen</Button>
								</Link>
							</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/24_SENMVKU_Starkregen_Pluvial-Fluvial-07.png"
							alt={t("generalInfo.hazardVsRisk.risk.image.alt")}
							caption={t("generalInfo.hazardVsRisk.risk.image.caption")}
							copyright={t("generalInfo.hazardVsRisk.risk.image.copyright")}
						/>
					}
				/>
			</section>
			<div className="divider" />
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("generalInfo.assessment.title")}</h2>
							<p className="">{t("generalInfo.assessment.how.description")}</p>
							<p className="">{t("generalInfo.assessment.how.note")}</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/24_SENMVKU_Starkregen_Pluvial-Fluvial-08-2.png"
							alt={t("generalInfo.assessment.how.image.alt")}
							caption={t("generalInfo.assessment.how.image.caption")}
							copyright={t("generalInfo.assessment.how.image.copyright")}
						/>
					}
					slotC={
						<div className="flex flex-col gap-6">
							<p className="">
								{t("generalInfo.assessment.distribution.description")}
								<br />
								<Link
									href="https://www.berlin.de/umweltatlas/wasser/starkregen/fortlaufend-aktualisiert/zusammenfassung/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button variant="linkWithIcon">
										Starkregen- und Überflutungsgefahren 2025
									</Button>
								</Link>
							</p>
						</div>
					}
				/>
			</section>
			<div className="divider" />
			<section className="flex flex-col gap-6">
				<h2 className="">{t("generalInfo.furtherInformation.sectionTitle")}</h2>
				<Accordion
					type="single"
					collapsible
					variant="default"
					className="justify-start px-0 text-left"
				>
					<AccordionItem value="item1" variant="default">
						<AccordionTrigger variant="default">
							<h4> {t("generalInfo.furtherInformation.item1.title")}</h4>
						</AccordionTrigger>
						<AccordionContent variant="default">
							<p>{t("generalInfo.furtherInformation.item1.content")}</p>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item2" variant="default">
						<AccordionTrigger variant="default">
							<h4> {t("generalInfo.furtherInformation.item2.title")}</h4>
						</AccordionTrigger>
						<AccordionContent variant="default">
							<p>{t("generalInfo.furtherInformation.item1.content")}</p>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item3" variant="default">
						<AccordionTrigger variant="default">
							<h4> {t("generalInfo.furtherInformation.item3.title")}</h4>
						</AccordionTrigger>
						<AccordionContent variant="default">
							<p>{t("generalInfo.furtherInformation.item1.content")}</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</section>
		</div>
	);
}
