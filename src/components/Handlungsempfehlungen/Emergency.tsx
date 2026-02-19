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

const Emergency: React.FC = () => {
	const t = useTranslations("recommendations.emergency");
	const content = useMessages() as {
		recommendations: {
			emergency: {
				list1: TocMap;
				list2: TocMap;
				list3: TocMap;
				list4: TocMap;
				list5: TocMap;
			};
		};
	};
	const list1 = content.recommendations.emergency.list1;
	const list2 = content.recommendations.emergency.list2;
	const list3 = content.recommendations.emergency.list3;
	const list4 = content.recommendations.emergency.list4;
	const list5 = content.recommendations.emergency.list5;

	const Lists = [
		{
			listKey: "list1",
			img: "/HandlungsempfehlungIcons/Icon_Warn.png",
			list: list1,
			hasParagraph: true,
		},
		{
			listKey: "list2",
			img: "/HandlungsempfehlungIcons/icon_EmgerncyPackage.png",
			list: list2,
		},
		{
			listKey: "list3",
			img: "/HandlungsempfehlungIcons/icon_HelpingOthers.png",
			list: list3,
		},
		{
			listKey: "list4",
			img: "/HandlungsempfehlungIcons/Icon_Auto.png",
			list: list4,
			fullIMG: "/Verkehr-Autoumpacken.png",
		},
		{
			listKey: "list5",
			img: "/HandlungsempfehlungIcons/icon_Nassvorsorge.png",
			list: list5,
		},
	];
	return (
		<section className="mb-12 flex flex-col gap-12">
			<h2 className="font-normal">
				{t.rich("intro", {
					strong: (chunks) => <strong>{chunks}</strong>,
				})}
			</h2>
			<div className="bg-message-error p-6">
				<p className="whitespace-pre-line">
					{t.rich("warning1", {
						strong: (chunks) => <strong>{chunks}</strong>,
					})}
				</p>
			</div>
			{Lists.map(({ listKey, img, hasParagraph, list, fullIMG }) => (
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
								className="w-[calc(100%+3rem)] -translate-x-[1.5rem] lg:hidden"
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
			<div className="bg-message-error p-6">
				<p className="whitespace-pre-line">
					{t.rich("warning2", {
						strong: (chunks) => <strong>{chunks}</strong>,
					})}
				</p>
			</div>
		</section>
	);
};

export default Emergency;
