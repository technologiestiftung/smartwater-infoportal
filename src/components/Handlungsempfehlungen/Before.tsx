import React from "react";
import { useTranslations } from "next-intl";
import TextBlock from "../TextBlock";
import { Button, Image } from "berlin-ui-library";
import Link from "next/link";

const Before: React.FC = () => {
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
							<h2 className="">{t("recommendations.beforeEvent.title")}</h2>
							<h3 className="">
								{t("recommendations.beforeEvent.personalPreparedness.title1")}
							</h3>
							<p className="">
								{t("recommendations.beforeEvent.personalPreparedness.item1")}
							</p>
							<h3 className="">
								{t("recommendations.beforeEvent.personalPreparedness.title2")}
							</h3>
							<p className="">
								{t.rich(
									"recommendations.beforeEvent.personalPreparedness.item2",
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
									},
								)}
							</p>
							<h3 className="">
								{t("recommendations.beforeEvent.personalPreparedness.title3")}
							</h3>
							<p className="">
								{t("recommendations.beforeEvent.personalPreparedness.item3")}
							</p>
							<h3 className="">
								{t("recommendations.beforeEvent.personalPreparedness.title4")}
							</h3>
							<p className="">
								{t.rich(
									"recommendations.beforeEvent.personalPreparedness.item4",
									{
										link: (chunks) => (
											<Link
												href="https://www.berlin.de/katastrophenschutz/warnung-und-information/anlaufstellen-fuer-die-bevoelkerung/"
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
							</p>
							<Link
								href="https://www.bbk.bund.de/SharedDocs/Videos/DE/Warnung-Vorsorge/youtube-erklaerfilm-notgepaeck.html"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button variant="linkWithIcon" className="min-h-0">
									{t(
										"recommendations.beforeEvent.personalPreparedness.link3.title",
									)}
								</Button>
							</Link>
						</div>
					}
					slotB={
						<div className="flex h-full flex-col gap-6">
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/A3_Schutzmaßnahmen_Schutzmaßnahmen.png"
								alt={t(
									"recommendations.beforeEvent.personalPreparedness.image4.alt",
								)}
								caption={t(
									"recommendations.beforeEvent.personalPreparedness.image4.caption",
								)}
								copyright={t(
									"recommendations.beforeEvent.personalPreparedness.image4.copyright",
								)}
							/>
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_2.png"
								alt={t(
									"recommendations.beforeEvent.personalPreparedness.image5.alt",
								)}
								caption={t(
									"recommendations.beforeEvent.personalPreparedness.image5.caption",
								)}
								copyright={t(
									"recommendations.beforeEvent.personalPreparedness.image5.copyright",
								)}
							/>
						</div>
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
								{t("recommendations.beforeEvent.inBuilding.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.beforeEvent.inBuilding.item1")}</li>
								<li>{t("recommendations.beforeEvent.inBuilding.item2")}</li>
								<li>{t("recommendations.beforeEvent.inBuilding.item3")}</li>
								<li>{t("recommendations.beforeEvent.inBuilding.item4")}</li>
								<li>{t("recommendations.beforeEvent.inBuilding.item5")}</li>
								<li>{t("recommendations.beforeEvent.inBuilding.item6")}</li>
								<li>{t("recommendations.beforeEvent.inBuilding.item7")}</li>
								<li>{t("recommendations.beforeEvent.inBuilding.item8")}</li>
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
								{t("recommendations.beforeEvent.furtherInformation.title")}
							</h3>
							<p className="">
								{t("recommendations.beforeEvent.furtherInformation.subtitle")}
							</p>
							<ul className="list-disc space-y-2 pl-6">
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item1")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item2")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item3")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item4")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item5")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item6")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item7")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item8")}
								</li>

								<li>
									{t("recommendations.beforeEvent.furtherInformation.item9")}
								</li>
								<li>
									{t("recommendations.beforeEvent.furtherInformation.item10")}
								</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_4.png"
							alt={t(
								"recommendations.beforeEvent.furtherInformation.image.alt",
							)}
							caption={t(
								"recommendations.beforeEvent.furtherInformation.image.caption",
							)}
							copyright={t(
								"recommendations.beforeEvent.furtherInformation.image.copyright",
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
								{t("recommendations.beforeEvent.traffic.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.beforeEvent.traffic.item1")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item2")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item3")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item4")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item5")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_5.png"
							alt={t("recommendations.beforeEvent.traffic.image.alt")}
							className="w-full"
							caption={t("recommendations.beforeEvent.traffic.image.caption")}
							copyright={t(
								"recommendations.beforeEvent.traffic.image.copyright",
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
								{t("recommendations.beforeEvent.fluvialFlood.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.beforeEvent.fluvialFlood.item1")}</li>
								<li>{t("recommendations.beforeEvent.fluvialFlood.item2")}</li>
								<li>{t("recommendations.beforeEvent.fluvialFlood.item3")}</li>
							</ul>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_6.jpg"
							alt={t("recommendations.beforeEvent.fluvialFlood.image.alt")}
							caption={t(
								"recommendations.beforeEvent.fluvialFlood.image.caption",
							)}
							copyright={t(
								"recommendations.beforeEvent.fluvialFlood.image.copyright",
							)}
						/>
					}
				/>
			</section>
		</div>
	);
};

export default Before;
