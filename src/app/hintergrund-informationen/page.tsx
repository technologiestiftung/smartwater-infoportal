"use client";
import TextBlock from "@/components/TextBlock";
import Link from "next/link";
import { Image } from "berlin-ui-library";
import { useMessages, useTranslations } from "next-intl";
import { ReactNode } from "react";

type TocMap = Record<string, string>;

export default function GeneralInformation() {
	const t = useTranslations();

	const content = useMessages() as {
		generalInfo: {
			tableOfContents: {
				items: TocMap;
			};
			floodThroughRain: {
				list: {
					items: TocMap;
				};
			};
			assessment: {
				paragraphs: TocMap;
			};
			types: {
				table: {
					head: TocMap;
					heavyRain: {
						row1: TocMap;
						row2: TocMap;
						row3: TocMap;
					};
					flood: {
						row1: TocMap;
						row2: TocMap;
						row3: TocMap;
					};
				};
			};
			handling: {
				paragraphs: TocMap;
			};
			furtherInformation: {
				list: TocMap;
			};
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
			return (
				<th className="w-0 whitespace-nowrap border border-[#dddddd] p-[1em_0.65em] text-left align-top font-bold text-black"></th>
			);
		}
		return (
			<th className="whitespace-pre-line border border-[#dddddd] bg-[#f5f5f5] p-[1em_0.65em] text-left align-top font-bold text-black">
				{text}
			</th>
		);
	};
	const TableCell = ({ text, title }: { text: ReactNode; title?: boolean }) => {
		if (title) {
			return (
				<td
					rowSpan={3}
					className="w-0 whitespace-nowrap border border-[#dddddd] bg-[#f5f5f5] p-[1em_0.65em] align-top font-bold"
				>
					{text}
				</td>
			);
		}
		return (
			<td className="whitespace-pre-line border border-[#dddddd] p-[1em_0.65em]">
				{text}
			</td>
		);
	};

	const scrollToWithOffset = (id: string, offset = 128) => {
		const el = document.getElementById(id);
		if (!el) {
			return;
		}

		const y = el.getBoundingClientRect().top + window.pageYOffset - offset;

		window.scrollTo({ top: y, behavior: "smooth" });
	};

	return (
		<>
			<div className="flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
				<section className="flex flex-col gap-6">
					<h1 className="">{t("generalInfo.pageTitle")}</h1>
					<h2 className="">{t("generalInfo.tableOfContents.title")}</h2>
					<ul className="list-disc ps-6 [&>li::marker]:text-[var(--primary)]">
						{Object.entries(tableOfContentsItems).map(([key, label]) => (
							<li key={key}>
								<a
									href={`#${key}`}
									className="text-text-link"
									onClick={(e) => {
										e.preventDefault();
										scrollToWithOffset(key);
									}}
								>
									{label}
								</a>
							</li>
						))}
					</ul>
				</section>
				<div className="divider" id="anker1" />
				<section className="">
					<TextBlock
						desktopColSpans={{ col1: 2, col2: 3 }}
						className="w-full gap-6"
						reverseDesktopColumns={true}
						slotA={
							<div className="flex w-full flex-col gap-6">
								<h2 className="">{t("generalInfo.definition.title")}</h2>
								<p className="whitespace-pre-line">
									{t("generalInfo.definition.description")}
								</p>
							</div>
						}
						slotB={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/24_SENMVKU_Starkregen_Pluvial-Fluvial-06.png"
								alt={t("generalInfo.definition.image.alt")}
								caption={t("generalInfo.definition.image.caption")}
								copyright={t("generalInfo.definition.image.copyright")}
								withZoomBox
							/>
						}
					/>
				</section>
				<div className="divider" id="anker2" />
				<section className="">
					<TextBlock
						desktopColSpans={{ col1: 3, col2: 2 }}
						className="w-full gap-6"
						slotA={
							<div className="flex w-full flex-col gap-6">
								<h2 className="">{t("generalInfo.hazardVsRisk.title")}</h2>
								<p className="">{t("generalInfo.hazardVsRisk.description")}</p>
								<h3 className="">
									{t("generalInfo.hazardVsRisk.hazard.title")}
								</h3>
								<p className="">
									{t("generalInfo.hazardVsRisk.hazard.description")}
								</p>
								<h3 className="">{t("generalInfo.hazardVsRisk.risk.title")}</h3>
								<p className="whitespace-pre-line">
									{t.rich("generalInfo.hazardVsRisk.risk.description", {
										link1: (chunks) => (
											<Link
												href="/handlungsempfehlungen"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
									})}
								</p>
							</div>
						}
						slotB={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/24_SENMVKU_Starkregen_Pluvial-Fluvial-07.png"
								alt={t("generalInfo.hazardVsRisk.image.alt")}
								caption={t("generalInfo.hazardVsRisk.image.caption")}
								copyright={t("generalInfo.hazardVsRisk.image.copyright")}
								withZoomBox
							/>
						}
					/>
				</section>
				<div className="divider" id="anker3" />
				<section className="">
					<TextBlock
						desktopColSpans={{ col1: 2, col2: 3 }}
						className="w-full gap-6"
						reverseDesktopColumns={true}
						slotA={
							<div className="flex w-full flex-col gap-6">
								<h2 className="">{t("generalInfo.floodThroughRain.title")}</h2>
								<p className="whitespace-pre-line">
									{t.rich("generalInfo.floodThroughRain.description", {
										link: (chunks) => (
											<Link
												href="https://www.gdv.de/gdv/themen/klima/128-millionen-euro-starkregen-schaden-in-berlin-52782"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
									})}
								</p>
								<ul className="list-decimal ps-6">
									{Object.keys(floodThroughRainItems).map((key) => (
										<li key={key} className="whitespace-pre-line">
											{t.rich(
												`generalInfo.floodThroughRain.list.items.${key}`,
												{
													link: (chunks) => (
														<Link
															href="https://www.dwd.de/DE/wetter/thema_des_tages/2025/9/28.html"
															target="_blank"
															rel="noopener noreferrer"
															className="text-text-link underline"
														>
															{chunks}
														</Link>
													),
												},
											)}
										</li>
									))}
								</ul>
							</div>
						}
						slotB={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/Enstehung_Starkregenereignis.png"
								alt={t("generalInfo.floodThroughRain.image.alt")}
								caption={t("generalInfo.floodThroughRain.image.caption")}
								copyright={t("generalInfo.floodThroughRain.image.copyright")}
								withZoomBox
							/>
						}
					/>
				</section>
				<div className="divider" id="anker4" />
				<section className="">
					<TextBlock
						desktopColSpans={{ col1: 3, col2: 2 }}
						className="w-full gap-6"
						slotA={
							<div className="flex w-full flex-col gap-6">
								<h2 className="">{t("generalInfo.assessment.title")}</h2>
								{Object.entries(assessmentItems).map(([key]) => (
									<p key={key} className="">
										{t.rich(`generalInfo.assessment.paragraphs.${key}`, {
											strong: (chunks) => <strong>{chunks}</strong>,
											link1: (chunks) => (
												<Link
													href="#anker3"
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
											link2: (chunks) => (
												<Link
													href="/hochwasser-check"
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
											link3: (chunks) => (
												<Link
													href="https://www.berlin.de/umweltatlas/wasser/starkregen/fortlaufend-aktualisiert/zusammenfassung/"
													target="_blank"
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
										})}
									</p>
								))}
							</div>
						}
						slotB={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/Wahrscheinlichkeiten.png"
								alt={t("generalInfo.assessment.image.alt")}
								caption={t("generalInfo.assessment.image.caption")}
								copyright={t("generalInfo.assessment.image.copyright")}
								withZoomBox
							/>
						}
					/>
				</section>
				<div className="divider" id="anker5" />
				<section className="">
					<TextBlock
						desktopColSpans={{ col1: 2, col2: 3 }}
						className="w-full gap-6"
						reverseDesktopColumns={true}
						slotA={
							<div className="flex w-full flex-col gap-6">
								<h2 className="">{t("generalInfo.types.title")}</h2>
								<p className="whitespace-pre-line">
									{t.rich("generalInfo.types.description", {
										link1: (chunks) => (
											<Link
												href="https://gdi.berlin.de/viewer/main/"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
										link2: (chunks) => (
											<Link
												href="#anker4"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
									})}
								</p>
							</div>
						}
						slotB={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/Starkregenhinweiskarte-Starkregengefahrenkarte.jpg"
								alt={t("generalInfo.types.image.alt")}
								caption={t("generalInfo.types.image.caption")}
								copyright={t("generalInfo.types.image.copyright")}
								withZoomBox
							/>
						}
					/>
					<div className="max-w-[calc(100vw - 48px)] overflow-x-scroll">
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
									<TableCell
										title
										text={t("generalInfo.types.table.heavyRain.title")}
									/>
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
									<TableCell
										title
										text={t("generalInfo.types.table.flood.title")}
									/>
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
					<p className="mt-1 break-words px-4 text-sm font-normal leading-tight text-black lg:px-0">
						Tabelle 1: Überblick über die Karten im Geoportal, die zum Thema
						Hochwasser erstellt wurden.
					</p>
				</section>
				<div className="divider" id="anker6" />
				<section className="">
					<TextBlock
						desktopColSpans={{ col1: 3, col2: 2 }}
						className="w-full gap-6"
						slotA={
							<div className="flex w-full flex-col gap-6">
								<h2 className="">{t("generalInfo.handling.title")}</h2>
								{Object.entries(handlingItems).map(([key]) => (
									<p key={key} className="">
										{t.rich(`generalInfo.handling.paragraphs.${key}`, {
											link1: (chunks) => (
												<Link
													href="https://regenwasseragentur.berlin/schwammstadt/"
													target="_blank"
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
											link2: (chunks) => (
												<Link
													href="https://www.gesetze-im-internet.de/whg_2009/__5.html"
													target="_blank"
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
											link3: (chunks) => (
												<Link
													href="/hochwasser-check"
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
											link4: (chunks) => (
												<Link
													href="/handlungsempfehlungen"
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
										})}
									</p>
								))}
							</div>
						}
						slotB={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/Abbildung5.png"
								alt={t("generalInfo.handling.image.alt")}
								caption={t("generalInfo.handling.image.caption")}
								copyright={t("generalInfo.handling.image.copyright")}
								withZoomBox
							/>
						}
					/>
				</section>
				<div className="divider" id="anker7" />
				<section className="">
					<div className="flex w-full flex-col gap-6">
						<h2 className="">{t("generalInfo.furtherInformation.title")}</h2>
						<ul className="list-disc ps-6 [&>li::marker]:text-[var(--primary)]">
							{Object.entries(furtherInformationItems).map(([key]) => (
								<li key={key}>
									{t.rich(`generalInfo.furtherInformation.list.${key}`, {
										link1: (chunks) => (
											<Link
												href="https://www.naturgefahrenportal.de/de"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
										link2: (chunks) => (
											<Link
												href="https://www.bmwsb.bund.de/SharedDocs/downloads/DE/publikationen/raumordnung/hochwasserschutzfibel.html"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
										link3: (chunks) => (
											<Link
												href="https://www.hochwasser-pass.info/"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
										link4: (chunks) => (
											<Link
												href="https://www.bbk.bund.de/DE/Themen/Risikomanagement/Baulicher-Bevoelkerungsschutz/Schutz-vor-Naturgefahren/Hochwasser/hochwasser_node.html"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
										link5: (chunks) => (
											<Link
												href="https://www.bbsr.bund.de/BBSR/DE/veroeffentlichungen/sonderveroeffentlichungen/2018/leitfaden-starkregen-auflage-3-dl.pdf?__blob=publicationFile&v=2"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link underline"
											>
												{chunks}
											</Link>
										),
									})}
								</li>
							))}
						</ul>
						<h3>{t("generalInfo.furtherInformation.subTitle")}</h3>
						<p className="whitespace-pre-line">
							{t.rich("generalInfo.furtherInformation.description", {
								link1: (chunks) => (
									<Link
										href="https://www.umweltbundesamt.de/publikationen/vorsorge-gegen-starkregenereignisse-massnahmen-zur"
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-link underline"
									>
										{chunks}
									</Link>
								),
								link2: (chunks) => (
									<Link
										href="https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/PiB/PiB-23-starkregen.pdf?__blob=publicationFile&v=8"
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-link underline"
									>
										{chunks}
									</Link>
								),
								link3: (chunks) => (
									<Link
										href="https://publishup.uni-potsdam.de/opus4-ubp/frontdoor/deliver/index/docId/50056/file/NRC_TaskForce.pdf"
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-link underline"
									>
										{chunks}
									</Link>
								),
							})}
						</p>
					</div>
				</section>
			</div>
		</>
	);
}
