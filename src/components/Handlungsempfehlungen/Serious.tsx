import React, { FC, ReactNode } from "react";
import { useMessages, useTranslations } from "next-intl";
import Link from "next/link";
import NextImage from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Image } from "berlin-ui-library";

type TocMap = Record<string, string>;
interface FullResponsiveImageProps {
	fullIMG?: string;
	fullIMGDesktop?: string;
	fullIMGMobile?: string;
	listKey?: string;
}
const lisztIconSize = 32;

const Serious: React.FC = () => {
	const t = useTranslations("recommendations.serious");
	const content = useMessages() as {
		recommendations: {
			serious: {
				list1: TocMap;
				list2: TocMap;
				list3: TocMap;
				list4: TocMap;
				list5: TocMap;
			};
		};
	};
	const list1 = content.recommendations.serious.list1;
	const list2 = content.recommendations.serious.list2;
	const list3 = content.recommendations.serious.list3;
	const list4 = content.recommendations.serious.list4;
	const list5 = content.recommendations.serious.list5;

	const getLink = (chunks: ReactNode) => {
		let text = "";
		if (typeof chunks === "string") {
			text = chunks;
		} else if (Array.isArray(chunks)) {
			text = chunks.join("");
		}
		if (text.includes("NINA")) {
			return {
				target: "_blank",
				link: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Warn-App-NINA/warn-app-nina_node.html",
			};
		}
		if (text.includes("WarnWetter")) {
			return {
				target: "_blank",
				link: "https://www.dwd.de/DE/service/dwd-apps/dwdapps_node.html",
			};
		}
		if (text.includes("Sirenen")) {
			return {
				target: "_blank",
				link: "https://www.berlin.de/katastrophenschutz/warnung-und-information/sirenen/artikel.1578804.php#headline_1_39",
			};
		}
		if (text.includes("Aquaplaning")) {
			return {
				target: "_blank",
				link: "https://www.adac.de/rund-ums-fahrzeug/ausstattung-technik-zubehoer/reifen/sicherheit/aquaplaning/",
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
			img: "/HandlungsempfehlungIcons/Icon_Achtung.png",
			list: list1,
		},
		{
			listKey: "list2",
			img: "/HandlungsempfehlungIcons/Icon_Warn.png",
			list: list2,
		},
		{
			listKey: "list3",
			img: "/HandlungsempfehlungIcons/Icon_Ueberflutungsflaechen.png",
			list: list3,
			fullIMG: "/Verkehr_überflutung.png",
		},
		{
			listKey: "list4",
			img: "/HandlungsempfehlungIcons/Icon_AutoUeberflutungsflaechen.png",
			list: list4,
			fullIMGDesktop: "/Unterführung_Tiefgarage_Auto-desktop.jpg",
			fullIMGMobile: "/Unterführung_Tiefgarage_Auto-mobile.jpg",
		},
		{
			listKey: "list5",
			img: "/HandlungsempfehlungIcons/icon_EmgerncyPackage.png",
			list: list5,
		},
	];

	const FullResponsiveImage: FC<FullResponsiveImageProps> = ({
		fullIMG,
		fullIMGDesktop,
		fullIMGMobile,
		listKey,
	}) => {
		const desktopSrc = fullIMG ?? fullIMGDesktop;
		const mobileSrc = fullIMG ?? fullIMGMobile;
		if (!mobileSrc || !desktopSrc) {
			return null;
		}
		return (
			<>
				<div className="flex justify-center">
					<Image
						className="hidden w-[75%] lg:block"
						src={desktopSrc}
						alt={t(`${listKey}Image.alt`)}
						caption={t(`${listKey}Image.caption`)}
						copyright={t(`${listKey}Image.copyright`)}
						withZoomBox
					/>
				</div>
				<Image
					className="w-[calc(100%+3rem)] -translate-x-[1.5rem] lg:hidden"
					src={mobileSrc}
					alt={t(`${listKey}Image.alt`)}
					caption={t(`${listKey}Image.caption`)}
					copyright={t(`${listKey}Image.copyright`)}
					withZoomBox
				/>
			</>
		);
	};

	return (
		<section className="mb-12 flex flex-col gap-12">
			<h2 className="font-normal">
				{t.rich("intro", {
					strong: (chunks) => <strong>{chunks}</strong>,
				})}
			</h2>
			{Lists.map(
				({ listKey, img, list, fullIMG, fullIMGDesktop, fullIMGMobile }) => (
					<div className="flex flex-col gap-6" key={listKey}>
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
									underline: (chunks) => (
										<span className="underline">{chunks}</span>
									),
								})}
							</h3>
						</div>
						<ul className={"list-none space-y-2 lg:ps-12"}>
							{Object.keys(list).map((key) => (
								<li key={key} className="flex items-start gap-2">
									<FontAwesomeIcon
										icon={faCheck}
										className={`flex-shrink-0 text-[18px]`}
									/>
									<span className="whitespace-pre-line">
										{t.rich(`${listKey}.${key}`, {
											link: (chunks) => (
												<Link
													href={getLink(chunks).link}
													target={getLink(chunks).target}
													rel="noopener noreferrer"
													className="text-text-link underline"
												>
													{chunks}
												</Link>
											),
											strong: (chunks) => <strong>{chunks}</strong>,
										})}
									</span>
								</li>
							))}
						</ul>
						<FullResponsiveImage
							fullIMG={fullIMG}
							fullIMGDesktop={fullIMGDesktop}
							fullIMGMobile={fullIMGMobile}
							listKey={listKey}
						/>
					</div>
				),
			)}
		</section>
	);
};

export default Serious;
