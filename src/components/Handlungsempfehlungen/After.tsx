import React from "react";
import { useTranslations } from "next-intl";
import TextBlock from "../TextBlock";
import { Button, Image } from "berlin-ui-library";
import Link from "next/link";

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
							<h3 className="">
								{t("recommendations.afterEvent.personalPreparedness.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li className="">
									{t.rich(
										"recommendations.afterEvent.personalPreparedness.item1",
										{
											link1: (chunks) => (
												<Link
													href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Warn-App-NINA/warn-app-nina_node.html"
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button variant="linkWithIcon" className="min-h-0">
														{chunks}
													</Button>
												</Link>
											),
											link2: (chunks) => (
												<Link
													href="https://www.dwd.de/DE/service/dwd-apps/dwdapps_node.html"
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button variant="linkWithIcon" className="min-h-0">
														{chunks}
													</Button>
												</Link>
											),
											link3: (chunks) => (
												<Link
													href="https://www.naturgefahrenportal.de/de"
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button variant="linkWithIcon" className="min-h-0">
														{chunks}
													</Button>
												</Link>
											),
										},
									)}
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
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_7.png"
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
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_3.png"
							alt={t("recommendations.beforeEvent.inBuilding.image.alt")}
							caption={t(
								"recommendations.beforeEvent.inBuilding.image.caption",
							)}
							copyright={t(
								"recommendations.beforeEvent.inBuilding.image.copyright",
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
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_9.png"
							alt={t("recommendations.afterEvent.traffic.image.alt")}
							caption={t("recommendations.afterEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.afterEvent.traffic.image.copyright",
							)}
						/>
					}
				/>
			</section>
			{/* <section className="">
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
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
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
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/imagery.png"
							alt={t("recommendations.afterEvent.traffic.image.alt")}
							caption={t("recommendations.afterEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.afterEvent.traffic.image.copyright",
							)}
						/>
					}
				/>
			</section> */}
		</div>
	);
};

export default After;
