// components/Before.tsx
import { cn } from "@/lib/utils";
import { LINK_MAP } from "@/lib/utils/linkMap";
import { richText } from "@/lib/utils/richText";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Image } from "berlin-ui-library";
import { useMessages, useTranslations } from "next-intl";
import NextImage from "next/image";
import React from "react";

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

	const Lists = [
		{
			listKey: "list1",
			img: "/HandlungsempfehlungIcons/icon_verhaltensvorsorge.png",
			list: content.recommendations.beforeEvent.list1,
			hasParagraph: true,
		},
		{
			listKey: "list2",
			img: "/HandlungsempfehlungIcons/icon_versicherung.png",
			list: content.recommendations.beforeEvent.list2,
			fullIMG: "/BeforeList2IMG.jpg",
			hasParagraph: true,
		},
		{
			listKey: "list3",
			img: "/HandlungsempfehlungIcons/icon_Trockenvorsorge.png",
			list: content.recommendations.beforeEvent.list3,
			afterList: "afterList3",
			hasParagraph: true,
		},
		{
			listKey: "list4",
			img: "/HandlungsempfehlungIcons/icon_Nassvorsorge.png",
			list: content.recommendations.beforeEvent.list4,
			hasParagraph: true,
		},
		{
			listKey: "list5",
			img: "/HandlungsempfehlungIcons/icon_Ausweichen.png",
			list: content.recommendations.beforeEvent.list5,
			hasParagraph: true,
			afterList: "afterList5",
			afterListImage: "/Hochwasserschutzfibel_Bild.png",
		},
	];

	return (
		<section className="mb-12 flex flex-col gap-12">
			<h2 className="font-normal">
				{t.rich("intro", richText())}
			</h2>
			{Lists.map(({ listKey, img, hasParagraph, list, fullIMG, afterList, afterListImage }) => (
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
								{t.rich(`${listKey}Intro`, richText())}
							</h3>
						</div>
						{hasParagraph && (
							<p>{t.rich(`${listKey}Paragraph`, richText())}</p>
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
								<FontAwesomeIcon icon={faCheck} className="shrink-0 text-[18px]" />
								<span>
									{t.rich(`${listKey}.${key}`, richText(LINK_MAP))}
								</span>
							</li>
						))}
					</ul>
					{afterList && (
						<div className="flex flex-col gap-4 lg:flex-row">
							<p className={cn("lg:ps-12", afterListImage && "lg:max-w-[50%]")}>
								{t.rich(afterList, richText(LINK_MAP))}
							</p>
							{afterListImage && (
								<NextImage
									src={afterListImage}
									alt=""
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
			))}
		</section>
	);
};

export default Before;