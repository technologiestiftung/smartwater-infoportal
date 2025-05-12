import React from "react";
import { useTranslations } from "next-intl";
import TextBlock from "../TextBlock";
import { Image } from "berlin-ui-library";

const After: React.FC = () => {
	const t = useTranslations();
	return (
		<div className="flex flex-col gap-12">
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">
								{t("recommendations.afterEvent.personalPreparedness.title")}
							</h2>
							<ul className="list-disc space-y-2 pl-6">
								<li className="">
									{t("recommendations.afterEvent.personalPreparedness.item1")}
								</li>
								<li className="">
									{t("recommendations.afterEvent.personalPreparedness.item2")}
								</li>
								<li className="">
									{t("recommendations.afterEvent.personalPreparedness.item3")}
								</li>
								<li className="">
									{t("recommendations.afterEvent.personalPreparedness.item4")}
								</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							src="/imagery.png"
							alt={t(
								"recommendations.afterEvent.personalPreparedness.image.alt",
							)}
							className="w-full"
							caption={t(
								"recommendations.afterEvent.personalPreparedness.image.caption",
							)}
							copyright={t(
								"recommendations.afterEvent.personalPreparedness.image.copyright",
							)}
						/>
					}
				/>
			</section>
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 3, col2: 2 }}
					className="w-full gap-6"
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h3 className="">
								{t("recommendations.afterEvent.inBuilding.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.afterEvent.inBuilding.item1")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item2")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item3")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item4")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item5")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item6")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item7")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item8")}</li>
								<li>{t("recommendations.afterEvent.inBuilding.item9")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.afterEvent.inBuilding.image.alt")}
							caption={t("recommendations.afterEvent.inBuilding.image.caption")}
							copyright={t(
								"recommendations.afterEvent.inBuilding.image.copyright",
							)}
						/>
					}
				/>
			</section>
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h3 className="">
								{t("recommendations.afterEvent.traffic.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.afterEvent.traffic.item1")}</li>
								<li>{t("recommendations.afterEvent.traffic.item2")}</li>
								<li>{t("recommendations.afterEvent.traffic.item3")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.afterEvent.traffic.image.alt")}
							caption={t("recommendations.afterEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.afterEvent.traffic.image.copyright",
							)}
						/>
					}
				/>
			</section>
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 3, col2: 2 }}
					className="w-full gap-6"
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h3 className="">
								{t("recommendations.afterEvent.heavyRain.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.afterEvent.heavyRain.item1")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.afterEvent.traffic.image.alt")}
							caption={t("recommendations.afterEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.afterEvent.traffic.image.copyright",
							)}
						/>
					}
				/>
			</section>
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h3 className="">
								{t("recommendations.afterEvent.fluvialFlood.title")}
							</h3>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.afterEvent.traffic.image.alt")}
							caption={t("recommendations.afterEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.afterEvent.traffic.image.copyright",
							)}
						/>
					}
				/>
			</section>
		</div>
	);
};

export default After;
