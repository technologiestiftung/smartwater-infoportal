import { cn } from "@/lib/utils";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Image, Link } from "berlin-ui-library";
import { useMessages, useTranslations } from "next-intl";
import NextImage from "next/image";
import React, { ReactNode } from "react";

type TocMap = Record<string, string>;
const lisztIconSize = 44;

const Before: React.FC = () => {
	const t = useTranslations("recommendations.beforeEvent");
	const content = useMessages() as {
		recommendations: {
			beforeEvent: {
				list1: TocMap;
				list2: TocMap;
				list3: TocMap;
				list4: TocMap;
				list5: TocMap;
			};
		};
	};
	const list1 = content.recommendations.beforeEvent.list1;
	const list2 = content.recommendations.beforeEvent.list2;
	const list3 = content.recommendations.beforeEvent.list3;
	const list4 = content.recommendations.beforeEvent.list4;
	const list5 = content.recommendations.beforeEvent.list5;

	const getLink = (key: string, chunks: ReactNode, listKey: string) => {
		let text = "";
		if (typeof chunks === "string") {
			text = chunks;
		} else if (Array.isArray(chunks)) {
			text = chunks.join("");
		}

		if (key === "entry1") {
			return {
				target: "_self",
				link: "/#hochwasser-check",
			};
		}
		if (key === "entry2") {
			if (listKey === "list1") {
				return {
					target: "_blank",
					link: text.includes("risiko")
						? "https://www.berlin.de/sen/uvk/umwelt/wasser-und-geologie/hochwasser/hochwasserrisikomanagementrichtlinie/#risikokarten"
						: "https://www.berlin.de/sen/uvk/umwelt/wasser-und-geologie/starkregen-und-ueberflutungen/gefahren/",
				};
			}
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.gdv.de/gdv/statistik/datenservice-zum-naturgefahrenreport/sachversicherung-elementar",
			};
		}
		if (key === "entry3") {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.hochwasserzentralen.de/",
			};
		}
		if (key === "entry4") {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.naturgefahrenportal.de/de",
			};
		}
		if (key === "entry6") {
			return {
				target: "_blank",
				link: "https://www.berlin.de/katastrophenschutz/warnung-und-information/warnung-und-information-der-bevoelkerung/artikel.1588862.php",
			};
		}
		if (key === "entry7") {
			return {
				target: "_blank",
				link: "https://www.berlin.de/katastrophenschutz/warnung-und-information/warnung-und-information-der-bevoelkerung/warnung-und-information-der-bevoelkerung-in-gefahrenlagen-1273411.php#berlin",
			};
		}
		if (key === "entry8") {
			return {
				target: "_blank",
				variant: "extern",
				link: text.includes("NINA")
					? "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Warn-App-NINA/warn-app-nina_node.html"
					: "https://www.dwd.de/DE/service/dwd-apps/dwdapps_node.html",
			};
		}
		if (key === "entry9") {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.dwd.de/DE/wetter/warnungen_aktuell/kriterien/warnstufen.html",
			};
		}
		if (key === "entry10") {
			return {
				target: "_blank",
				link: "https://www.berlin.de/katastrophenschutz/warnung-und-information/sirenen/artikel.1578804.php#headline_1_39",
			};
		}
		if (key === "entry11") {
			return {
				target: "_blank",
				link: "https://www.berlin.de/katastrophenschutz/warnung-und-information/anlaufstellen-fuer-die-bevoelkerung/",
			};
		}
		if (key === "entry12") {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/Buergerinformationen/Ratgeber/BBK-Vorsorgen-fuer-Krisen-und-Katastrophen.pdf?__blob=publicationFile&v=41",
			};
		}
		if (key === "entry13") {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/Buergerinformationen/Ratgeber/BBK-Vorsorgen-fuer-Krisen-und-Katastrophen.pdf?__blob=publicationFile&v=41",
			};
		}
		if (key === "entry14") {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/Buergerinformationen/Ratgeber/BBK-Vorsorgen-fuer-Krisen-und-Katastrophen.pdf?__blob=publicationFile&v=41",
			};
		}
		return {
			target: "_self",
			link: "#",
		};
	};

	const Lists = [
		{
			listKey: "list1",
			img: "/HandlungsempfehlungIcons/icon_verhaltensvorsorge.png",
			list: list1,
			hasParagraph: true,
		},
		{
			listKey: "list2",
			img: "/HandlungsempfehlungIcons/icon_versicherung.png",
			list: list2,
			fullIMG: "/BeforeList2IMG.jpg",
			hasParagraph: true,
		},
		{
			listKey: "list3",
			img: "/HandlungsempfehlungIcons/icon_Trockenvorsorge.png",
			list: list3,
			afterList: "afterList3",
			hasParagraph: true,
		},
		{
			listKey: "list4",
			img: "/HandlungsempfehlungIcons/icon_Nassvorsorge.png",
			list: list4,
			hasParagraph: true,
		},
		{
			listKey: "list5",
			img: "/HandlungsempfehlungIcons/icon_Ausweichen.png",
			list: list5,
			hasParagraph: true,
			afterList: "afterList5",
			afterListImage: "/Hochwasserschutzfibel_Bild.png",
		},
	];

	return (
		<section className="mb-12 flex flex-col gap-12">
			<h2 className="font-normal">
				{t.rich("intro", {
					strong: (chunks) => <strong>{chunks}</strong>,
				})}
			</h2>
			{Lists.map(
				({
					listKey,
					img,
					hasParagraph,
					list,
					fullIMG,
					afterList,
					afterListImage,
				}) => (
					<div className="flex flex-col gap-6" key={listKey}>
						<div className="space-y-2">
							<div className="flex items-center gap-4">
								<NextImage
									src={img}
									alt={`Icon for ${listKey}`}
									width={lisztIconSize}
									height={lisztIconSize}
								/>
								<h3 className="font-normal">
									{t.rich(`${listKey}Intro`, {
										strong: (chunks) => <strong>{chunks}</strong>,
									})}
								</h3>
							</div>
							{hasParagraph && (
								<p>
									{t.rich(`${listKey}Paragraph`, {
										strong: (chunks) => <strong>{chunks}</strong>,
									})}
								</p>
							)}
							{listKey === "list3" && (
								<p className="italic">{t("list3ParagraphNote")}</p>
							)}
							{listKey === "list4" && (
								<p className="italic">{t("list4ParagraphNote")}</p>
							)}
							{listKey === "list5" && (
								<p className="italic">{t("list5ParagraphNote")}</p>
							)}
						</div>
						<ul className="list-none space-y-2 lg:ps-12">
							{Object.keys(list).map((key) => (
								<li key={key} className="flex items-start gap-2">
									<FontAwesomeIcon
										icon={faCheck}
										className={`shrink-0 text-[18px]`}
									/>
									<span>
										{t.rich(`${listKey}.${key}`, {
											link: (chunks) => (
												<Link
													href={getLink(key, chunks, listKey).link}
													target={getLink(key, chunks, listKey).target}
													rel="noopener noreferrer"
													variant={getLink(key, chunks, listKey).variant || "default"}
												>
													{chunks}
												</Link>
											),
										})}
									</span>
								</li>
							))}
						</ul>
						{afterList && (
							<div className="flex flex-col gap-4 lg:flex-row">
								<p
									className={cn("lg:ps-12", afterListImage && "lg:max-w-[50%]")}
								>
									{t.rich(afterList, {
										link1: (chunks) => (
											<Link
												href="https://www.hochwasser-pass.info/"
												target="_blank"
												rel="noopener noreferrer"
												variant="extern"
											>
												{chunks}
											</Link>
										),
										link2: (chunks) => (
											<Link
												href="https://www.fib-bund.de/inhalt/themen/hochwasser/"
												target="_blank"
												rel="noopener noreferrer"
												variant="extern"
											>
												{chunks}
											</Link>
										),
									})}
								</p>
								{afterListImage && (
									<NextImage
										src={afterListImage}
										alt={`???`}
										width={160}
										height={160}
									/>
								)}
							</div>
						)}
						{fullIMG && (
							<>
								<div className="flex justify-center">
									<Image
										className="hidden w-[75%] lg:block"
										src={fullIMG}
										alt={t(`${listKey}Image.alt`)}
										caption={t(`${listKey}Image.caption`)}
										copyright={t(`${listKey}Image.copyright`)}
										withZoomBox
									/>
								</div>
								<Image
									className="w-[calc(100%+3rem)] -translate-x-6 lg:hidden"
									src={fullIMG}
									alt={t(`${listKey}Image.alt`)}
									caption={t(`${listKey}Image.caption`)}
									copyright={t(`${listKey}Image.copyright`)}
									withZoomBox
								/>
							</>
						)}
					</div>
				),
			)}
		</section>
	);
};

export default Before;
