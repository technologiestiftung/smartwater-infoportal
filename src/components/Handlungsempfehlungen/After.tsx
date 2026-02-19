import { LINK_MAP } from "@/lib/utils/linkMap";
import { richText } from "@/lib/utils/richText";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMessages, useTranslations } from "next-intl";
import NextImage from "next/image";
import React from "react";


type TocMap = Record<string, string>;
const lisztIconSize = 44;

const After: React.FC = () => {
	const t = useTranslations("recommendations.after");
	const content = useMessages() as {
		recommendations: {
			after: {
				list1: TocMap;
				list2: TocMap;
				list3: TocMap;
				list4: TocMap;
				list5: TocMap;
				list6: TocMap;
			};
		};
	};
	const list1 = content.recommendations.after.list1;
	const list2 = content.recommendations.after.list2;
	const list3 = content.recommendations.after.list3;
	const list4 = content.recommendations.after.list4;
	const list5 = content.recommendations.after.list5;
	const list6 = content.recommendations.after.list6;

	const Lists = [
		{
			listKey: "list1",
			img: "/HandlungsempfehlungIcons/Icon_Achtung.png",
			list: list1,
		},
		{
			listKey: "list2",
			img: "/HandlungsempfehlungIcons/icon_HelpingOthers.png",
			list: list2,
		},
		{
			listKey: "list3",
			img: "/HandlungsempfehlungIcons/Icon_Haus.png",
			list: list3,
		},
		{
			listKey: "list4",
			img: "/HandlungsempfehlungIcons/Icon_Kamera.png",
			list: list4,
		},
		{
			listKey: "list5",
			img: "/HandlungsempfehlungIcons/Icon_Auto2.png",
			list: list5,
		},
		{
			listKey: "list6",
			img: "/HandlungsempfehlungIcons/Icon_gruenesHaus.png",
			list: list6,
		},
	];

	return (
		<section className="mb-12 flex flex-col gap-12">
			<h2 className="font-normal">
				{t.rich("intro", {
					strong: (chunks) => <strong>{chunks}</strong>,
				})}
			</h2>
			{Lists.map(({ listKey, img, list }) => (
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
					<ul className="list-none space-y-2 lg:ps-12">
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
				</div>
			))}
		</section>
	);
};

export default After;
