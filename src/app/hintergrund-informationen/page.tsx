"use client";
import WrappingTextBlock from "@/components/WrappingTextBlock";
import { LINK_MAP } from "@/lib/utils/linkMap";
import { richText } from "@/lib/utils/richText";
import { Image } from "berlin-ui-library";
import { useMessages, useTranslations } from "next-intl";
import { ReactNode } from "react";

type TocMap = Record<string, string>;

const TableCell = ({ text, title }: { text: ReactNode; title?: boolean }) => {
	if (title) {
		return (
			<td rowSpan={3} className="w-0 border border-[#dddddd] bg-[#f5f5f5] p-1 align-top font-bold whitespace-pre-line lg:p-[1em_0.65em]">
				{text}
			</td>
		);
	}
	return (
		<td className="border border-[#dddddd] p-1 whitespace-pre-line lg:p-[1em_0.65em]">
			{text}
		</td>
	);
};

export default function GeneralInformation() {
	const t = useTranslations();
	const content = useMessages() as {
		generalInfo: {
			tableOfContents: { items: TocMap };
			floodThroughRain: { list: { items: TocMap } };
			assessment: { paragraphs: TocMap };
			types: {
				table: {
					head: TocMap;
					heavyRain: { row1: TocMap; row2: TocMap; row3: TocMap };
					flood: { row1: TocMap; row2: TocMap; row3: TocMap };
				};
			};
			handling: { paragraphs: TocMap };
			furtherInformation: { list: TocMap };
		};
	};

	const tableOfContentsItems = content.generalInfo.tableOfContents.items;
	const floodThroughRainItems = content.generalInfo.floodThroughRain.list.items;
	const assessmentItems = content.generalInfo.assessment.paragraphs;
	const typesEntries = content.generalInfo.types.table.head;
	const heavyRainRow1Entries = content.generalInfo.types.table.heavyRain.row1;
	const heavyRainRow2Entries = content.generalInfo.types.table.heavyRain.row2;
	const heavyRainRow3Entries = content.generalInfo.types.table.heavyRain.row3;
	const floodRow1Entries = content.generalInfo.types.table.flood.row1;
	const floodRow2Entries = content.generalInfo.types.table.flood.row2;
	const floodRow3Entries = content.generalInfo.types.table.flood.row3;
	const handlingItems = content.generalInfo.handling.paragraphs;
	const furtherInformationItems = content.generalInfo.furtherInformation.list;

	const TableHead = ({ text }: { text?: string }) => {
		if (!text) {
			return <th className="w-0 border border-[#dddddd] p-1 text-left align-top font-bold whitespace-nowrap text-black lg:p-[1em_0.65em]"></th>;
		}
		return (
			<th className="border border-[#dddddd] bg-[#f5f5f5] p-1 text-left align-top font-bold whitespace-pre-line text-black lg:p-[1em_0.65em]">
				{text}
			</th>
		);
	};

	return (
		<>
			<div className="flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
				<section className="flex flex-col gap-6">
					<h1>{t("generalInfo.pageTitle")}</h1>
					<h2>{t("generalInfo.tableOfContents.title")}</h2>
					<ul className="list-disc ps-6 [&>li::marker]:text-[--primary]">
						{Object.entries(tableOfContentsItems).map(([key, label]) => (
							<li key={key}>
								<a href={`#${key}`} className="text-text-link">{label}</a>
							</li>
						))}
					</ul>
				</section>
				<div className="divider scroll-mt-[62px] lg:scroll-mt-[85px]" id="anker1" />
				<section>
					<WrappingTextBlock
						imageWidth="50%"
						imageSide="left"
						image={
							<Image
								className="w-[calc(100%+2.5rem)] -translate-x-5 lg:w-full lg:translate-x-0"
								src="/24_SENMVKU_Starkregen_Pluvial-Fluvial-06.png"
								alt={t("generalInfo.definition.image.alt")}
								caption={t("generalInfo.definition.image.caption")}
								copyright={t("generalInfo.definition.image.copyright")}
								withZoomBox
							/>
						}
						text={
							<div className="[&>*+*]:mt-6">
								<h2>{t("generalInfo.definition.title")}</h2>
								<p className="whitespace-pre-line">{t("generalInfo.definition.description")}</p>
							</div>
						}
					/>
				</section>
				<div className="divider scroll-mt-[62px] lg:scroll-mt-[85px]" id="anker2" />
				<section>
					<WrappingTextBlock
						imageWidth="50%"
						imageSide="right"
						image={
							<Image
								className="w-[calc(100%+2.5rem)] -translate-x-5 lg:w-full lg:translate-x-0"
								src="/24_SENMVKU_Starkregen_Pluvial-Fluvial-07.png"
								alt={t("generalInfo.hazardVsRisk.image.alt")}
								caption={t("generalInfo.hazardVsRisk.image.caption")}
								copyright={t("generalInfo.hazardVsRisk.image.copyright")}
								withZoomBox
							/>
						}
						text={
							<div className="[&>*+*]:mt-6">
								<h2>{t("generalInfo.hazardVsRisk.title")}</h2>
								<p>{t("generalInfo.hazardVsRisk.description")}</p>
								<h3>{t("generalInfo.hazardVsRisk.hazard.title")}</h3>
								<p>{t("generalInfo.hazardVsRisk.hazard.description")}</p>
								<h3>{t("generalInfo.hazardVsRisk.risk.title")}</h3>
								<p className="whitespace-pre-line">
									{t.rich("generalInfo.hazardVsRisk.risk.description", richText(LINK_MAP))}
								</p>
							</div>
						}
					/>
				</section>
				<div className="divider scroll-mt-[62px] lg:scroll-mt-[85px]" id="anker3" />
				<section>
					<WrappingTextBlock
						imageWidth="50%"
						imageSide="left"
						image={
							<Image
								className="w-[calc(100%+2.5rem)] -translate-x-5 lg:w-full lg:translate-x-0"
								src="/Enstehung_Starkregenereignis.png"
								alt={t("generalInfo.floodThroughRain.image.alt")}
								caption={t("generalInfo.floodThroughRain.image.caption")}
								copyright={t("generalInfo.floodThroughRain.image.copyright")}
								withZoomBox
							/>
						}
						text={
							<div className="[&>*+*]:mt-6">
								<h2>{t("generalInfo.floodThroughRain.title")}</h2>
								<p className="whitespace-pre-line">
									{t.rich("generalInfo.floodThroughRain.description", richText(LINK_MAP))}
								</p>
								<ul className="list-decimal ps-6">
									{Object.keys(floodThroughRainItems).map((key) => (
										<li key={key} className="whitespace-pre-line">
											{t.rich(`generalInfo.floodThroughRain.list.items.${key}`, richText(LINK_MAP))}
										</li>
									))}
								</ul>
							</div>
						}
					/>
				</section>
				<div className="divider scroll-mt-[62px] lg:scroll-mt-[85px]" id="anker4" />
				<section>
					<WrappingTextBlock
						imageWidth="50%"
						imageSide="right"
						image={
							<Image
								className="w-[calc(100%+2.5rem)] -translate-x-5 lg:w-full lg:translate-x-0"
								src="/Wahrscheinlichkeiten.png"
								alt={t("generalInfo.assessment.image.alt")}
								caption={t("generalInfo.assessment.image.caption")}
								copyright={t("generalInfo.assessment.image.copyright")}
								withZoomBox
							/>
						}
						text={
							<div className="[&>*+*]:mt-6">
								<h2>{t("generalInfo.assessment.title")}</h2>
								{Object.entries(assessmentItems).map(([key]) => (
									<p key={key}>
										{t.rich(`generalInfo.assessment.paragraphs.${key}`, richText(LINK_MAP))}
									</p>
								))}
							</div>
						}
					/>
				</section>
				<div className="divider scroll-mt-[62px] lg:scroll-mt-[85px]" id="anker5" />
				<section className="relative mb-12 w-full lg:mb-0">
					<WrappingTextBlock
						imageWidth="50%"
						imageSide="left"
						image={
							<Image
								className="w-[calc(100%+2.5rem)] -translate-x-5 lg:w-full lg:translate-x-0"
								src="/Starkregenhinweiskarte-Starkregengefahrenkarte.jpg"
								alt={t("generalInfo.types.image.alt")}
								caption={t("generalInfo.types.image.caption")}
								copyright={t("generalInfo.types.image.copyright")}
								withZoomBox
							/>
						}
						text={
							<div className="[&>*+*]:mt-6">
								<h2>{t("generalInfo.types.title")}</h2>
								<p className="whitespace-pre-line">
									{t.rich("generalInfo.types.description", richText(LINK_MAP))}
								</p>
							</div>
						}
					/>
					<div className="max-w-[calc(100vw-2.5rem)] overflow-x-scroll">
						<table className="mt-12 w-full table-auto text-left">
							<thead>
								<tr>
									{Object.entries(typesEntries).map(([key, label]) => (
										<TableHead key={key} text={label} />
									))}
								</tr>
							</thead>
							<tbody>
								<tr>
									<TableCell title text={t("generalInfo.types.table.heavyRain.title")} />
									{Object.entries(heavyRainRow1Entries).map(([key, label]) => (
										<TableCell key={key} text={label} />
									))}
								</tr>
								<tr>
									{Object.entries(heavyRainRow2Entries).map(([key, label]) => (
										<TableCell key={key} text={label} />
									))}
								</tr>
								<tr>
									{Object.entries(heavyRainRow3Entries).map(([key, label]) => (
										<TableCell key={key} text={label} />
									))}
								</tr>
								<tr>
									<TableCell title text={t("generalInfo.types.table.flood.title")} />
									{Object.entries(floodRow1Entries).map(([key, label]) => (
										<TableCell key={key} text={label} />
									))}
								</tr>
								<tr>
									{Object.entries(floodRow2Entries).map(([key, label]) => (
										<TableCell key={key} text={label} />
									))}
								</tr>
								<tr>
									{Object.entries(floodRow3Entries).map(([key, label]) => (
										<TableCell key={key} text={label} />
									))}
								</tr>
							</tbody>
						</table>
					</div>
					<p className="mt-1 px-4 text-sm leading-tight font-normal break-words text-black lg:px-0">
						Tabelle 1: Überblick über die Karten im Geoportal, die zum Thema Hochwasser erstellt wurden.
					</p>
				</section>
				<div className="divider scroll-mt-[62px] lg:scroll-mt-[85px]" id="anker6" />
				<section>
					<WrappingTextBlock
						imageWidth="50%"
						imageSide="right"
						image={
							<Image
								className="w-[calc(100%+2.5rem)] -translate-x-5 lg:w-full lg:translate-x-0"
								src="/Abbildung5.png"
								alt={t("generalInfo.handling.image.alt")}
								caption={t("generalInfo.handling.image.caption")}
								copyright={t("generalInfo.handling.image.copyright")}
								withZoomBox
							/>
						}
						text={
							<div className="[&>*+*]:mt-6">
								<h2>{t("generalInfo.handling.title")}</h2>
								{Object.entries(handlingItems).map(([key]) => (
									<p key={key}>
										{t.rich(`generalInfo.handling.paragraphs.${key}`, richText(LINK_MAP))}
									</p>
								))}
							</div>
						}
					/>
				</section>
				<div className="divider scroll-mt-[62px] lg:scroll-mt-[85px]" id="anker7" />
				<section>
					<div className="flex w-full flex-col gap-6">
						<h2>{t("generalInfo.furtherInformation.title")}</h2>
						<ul className="list-disc ps-6 [&>li::marker]:text-[--primary]">
							{Object.entries(furtherInformationItems).map(([key]) => (
								<li key={key}>
									{t.rich(`generalInfo.furtherInformation.list.${key}`, richText(LINK_MAP))}
								</li>
							))}
						</ul>
						<h3>{t("generalInfo.furtherInformation.subTitle")}</h3>
						<p className="whitespace-pre-line">
							{t.rich("generalInfo.furtherInformation.description", richText(LINK_MAP))}
						</p>
					</div>
				</section>
			</div>
		</>
	);
}