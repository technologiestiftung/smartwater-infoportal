import { LINK_MAP } from "@/lib/utils/linkMap";
import { richText } from "@/lib/utils/richText";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Image } from "berlin-ui-library";
import { useMessages, useTranslations } from "next-intl";
import NextImage from "next/image";
import React, { FC } from "react";

type TocMap = Record<string, string>;
interface FullResponsiveImageProps {
	fullIMG?: string;
	fullIMGDesktop?: string;
	fullIMGMobile?: string;
	listKey?: string;
}
const lisztIconSize = 44;

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
			hasParagraph: true,
		},
		{
			listKey: "list3",
			img: "/HandlungsempfehlungIcons/Icon_Ueberflutungsflaechen.png",
			list: list3,
			fullIMG: "/Verkehr_ueberflutung.png",
		},
		{
			listKey: "list4",
			img: "/HandlungsempfehlungIcons/Icon_AutoUeberflutungsflaechen.png",
			list: list4,
			fullIMGDesktop: "/Unterfuehrung_Tiefgarage_Auto-desktop.jpg",
			fullIMGMobile: "/Unterfuehrung_Tiefgarage_Auto-mobile.jpg",
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
					className="w-[calc(100%+3rem)] -translate-x-6 lg:hidden"
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
				({
					listKey,
					img,
					hasParagraph,
					list,
					fullIMG,
					fullIMGDesktop,
					fullIMGMobile,
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
										underline: (chunks) => (
											<span className="underline">{chunks}</span>
										),
									})}
								</h3>
							</div>
							{hasParagraph && <p>{t(`${listKey}Paragraph`)}</p>}
						</div>
						<ul className={"list-none space-y-2 lg:ps-12"}>
							{Object.keys(list).map((key) => (
								<li key={key} className="flex items-start gap-2">
									<FontAwesomeIcon
										icon={faCheck}
										className={`shrink-0 text-[18px]`}
									/>
									<span className="whitespace-pre-line">
									{t.rich(`${listKey}.${key}`, {
										...richText(LINK_MAP),
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
