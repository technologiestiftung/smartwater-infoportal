import React from "react";
import { useTranslations } from "next-intl";
import TextBlock from "../TextBlock";
import { Image } from "berlin-ui-library";

const During: React.FC = () => {
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
								{t("recommendations.duringEvent.personalPreparedness.title")}
							</h2>
							<ul className="list-disc space-y-2 pl-6">
								<li className="">
									{t("recommendations.duringEvent.personalPreparedness.item1")}
								</li>
								<li className="">
									{t("recommendations.duringEvent.personalPreparedness.item2")}
								</li>
								<li className="">
									{t("recommendations.duringEvent.personalPreparedness.item3")}
								</li>
								<li className="">
									{t("recommendations.duringEvent.personalPreparedness.item4")}
								</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t(
								"recommendations.duringEvent.personalPreparedness.image.alt",
							)}
							caption={t(
								"recommendations.duringEvent.personalPreparedness.image.caption",
							)}
							copyright={t(
								"recommendations.duringEvent.personalPreparedness.image.copyright",
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
								{t("recommendations.duringEvent.inBuilding.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.duringEvent.inBuilding.item1")}</li>
								<li>{t("recommendations.duringEvent.inBuilding.item2")}</li>
								<li>{t("recommendations.duringEvent.inBuilding.item3")}</li>
								<li>{t("recommendations.duringEvent.inBuilding.item4")}</li>
								<li>{t("recommendations.duringEvent.inBuilding.item5")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.duringEvent.inBuilding.image.alt")}
							caption={t(
								"recommendations.duringEvent.inBuilding.image.caption",
							)}
							copyright={t(
								"recommendations.duringEvent.inBuilding.image.copyright",
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
								{t("recommendations.duringEvent.traffic.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.duringEvent.traffic.item1")}</li>
								<li>{t("recommendations.duringEvent.traffic.item2")}</li>
								<li>{t("recommendations.duringEvent.traffic.item3")}</li>
								<li>{t("recommendations.duringEvent.traffic.item4")}</li>
								<li>{t("recommendations.duringEvent.traffic.item5")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.duringEvent.traffic.image.alt")}
							caption={t("recommendations.duringEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.duringEvent.traffic.image.copyright",
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
								{t("recommendations.duringEvent.heavyRain.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.duringEvent.heavyRain.item1")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.duringEvent.traffic.image.alt")}
							caption={t("recommendations.duringEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.duringEvent.traffic.image.copyright",
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
								{t("recommendations.duringEvent.fluvialFlood.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.duringEvent.fluvialFlood.item1")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none md:-mx-0 md:w-auto"
							src="/imagery.png"
							alt={t("recommendations.duringEvent.traffic.image.alt")}
							caption={t("recommendations.duringEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.duringEvent.traffic.image.copyright",
							)}
						/>
					}
				/>
			</section>
		</div>
	);
};

export default During;
