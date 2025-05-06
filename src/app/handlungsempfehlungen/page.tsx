"use client";

import {
	Button,
	ImageComponent,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "berlin-ui-library";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Recommendations() {
	const t = useTranslations();
	return (
		<div className="flex w-full flex-col justify-start gap-6">
			<Link href="/">
				<Button variant="back-link" className="self-start">
					{t("common.backToStart")}
				</Button>
			</Link>
			<h1 className="">{t("recommendations.pageTitle")}</h1>
			<p className="">{t("recommendations.intro")}</p>
			<h2 className="text-accent">{t("recommendations.timeline.title")}</h2>
			<p className="text-accent">{t("recommendations.timeline.description")}</p>
			<Tabs defaultValue="before" className="">
				<TabsList>
					<TabsTrigger value="before">
						{t("recommendations.timeline.before")}
					</TabsTrigger>
					<TabsTrigger value="during">
						{t("recommendations.timeline.during")}
					</TabsTrigger>
					<TabsTrigger value="after">
						{t("recommendations.timeline.after")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="before">
					<div className="flex flex-col gap-6">
						<section className="flex flex-col gap-4">
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
								{t("recommendations.beforeEvent.personalPreparedness.item2")}
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
								{t("recommendations.beforeEvent.personalPreparedness.item4")}
							</p>
							<Button
								variant="link"
								className="self-start"
								onClick={() => {
									window.open(
										t(
											"recommendations.beforeEvent.personalPreparedness.link3.url",
										),
										"_blank",
									);
								}}
							>
								{t(
									"recommendations.beforeEvent.personalPreparedness.link3.title",
								)}
							</Button>

							<h3 className="">
								{t("recommendations.beforeEvent.personalPreparedness.title4")}
							</h3>
							<p className="">
								{t("recommendations.beforeEvent.personalPreparedness.item4")}
							</p>
							<ImageComponent
								src="/imagery.png"
								alt={t(
									"recommendations.beforeEvent.personalPreparedness.image4.alt",
								)}
								className="w-full"
								caption={t(
									"recommendations.beforeEvent.personalPreparedness.image4.caption",
								)}
								copyright={t(
									"recommendations.beforeEvent.personalPreparedness.image4.copyright",
								)}
							/>
						</section>
						<section className="flex flex-col gap-4">
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
						</section>
						<section className="flex flex-col gap-4">
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

									<li>
										{t("recommendations.beforeEvent.furtherInformation.item9")}
									</li>
									<li>
										{t("recommendations.beforeEvent.furtherInformation.item10")}
									</li>
								</li>
							</ul>
						</section>
						<section className="flex flex-col gap-4">
							<h3 className="">
								{t("recommendations.beforeEvent.traffic.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.beforeEvent.traffic.item1")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item2")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item3")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item4")}</li>
								<li>{t("recommendations.beforeEvent.traffic.item5")}</li>
								<ImageComponent
									src="/imagery.png"
									alt={t("recommendations.beforeEvent.traffic.image.alt")}
									className="w-full"
									caption={t(
										"recommendations.beforeEvent.traffic.image.caption",
									)}
								/>
							</ul>
						</section>
						<section className="flex flex-col gap-4">
							<h3 className="">
								{t("recommendations.beforeEvent.heavyRain.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.beforeEvent.heavyRain.item1")}</li>
								<li>{t("recommendations.beforeEvent.heavyRain.item2")}</li>
								<li>{t("recommendations.beforeEvent.heavyRain.item3")}</li>
							</ul>
							<ImageComponent
								src="/imagery.png"
								alt={t("recommendations.beforeEvent.heavyRain.image.alt")}
								className="w-full"
								caption={t(
									"recommendations.beforeEvent.heavyRain.image.caption",
								)}
								copyright={t(
									"recommendations.beforeEvent.heavyRain.image.copyright",
								)}
							/>
						</section>
						<section className="flex flex-col gap-4">
							<h3 className="">
								{t("recommendations.beforeEvent.fluvialFlood.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.beforeEvent.fluvialFlood.item1")}</li>
								<li>{t("recommendations.beforeEvent.fluvialFlood.item2")}</li>
								<li>{t("recommendations.beforeEvent.fluvialFlood.item3")}</li>
							</ul>
							<ImageComponent
								src="/imagery.png"
								alt={t("recommendations.beforeEvent.fluvialFlood.image.alt")}
								className="w-full"
								caption={t(
									"recommendations.beforeEvent.fluvialFlood.image.caption",
								)}
								copyright={t(
									"recommendations.beforeEvent.fluvialFlood.image.copyright",
								)}
							/>
						</section>
					</div>
				</TabsContent>
				<TabsContent value="during">
					<div className="flex flex-col gap-6">
						<section className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-4 md:order-2">
								<h2 className="">
									{t("recommendations.duringEvent.personalPreparedness.title")}
								</h2>
								<ul className="list-disc space-y-2 pl-6">
									<li className="">
										{t(
											"recommendations.duringEvent.personalPreparedness.item1",
										)}
									</li>
									<li className="">
										{t(
											"recommendations.duringEvent.personalPreparedness.item2",
										)}
									</li>
									<li className="">
										{t(
											"recommendations.duringEvent.personalPreparedness.item3",
										)}
									</li>
									<li className="">
										{t(
											"recommendations.duringEvent.personalPreparedness.item4",
										)}
									</li>
								</ul>
							</div>
							<ImageComponent
								src="/imagery.png"
								alt={t(
									"recommendations.duringEvent.personalPreparedness.image.alt",
								)}
								className="w-full md:order-1"
								caption={t(
									"recommendations.duringEvent.personalPreparedness.image.caption",
								)}
								copyright={t(
									"recommendations.duringEvent.personalPreparedness.image.copyright",
								)}
							/>
						</section>
						<section className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-4">
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
							<ImageComponent
								src="/imagery.png"
								alt={t("recommendations.duringEvent.inBuilding.image.alt")}
								className="w-full"
								caption={t(
									"recommendations.duringEvent.inBuilding.image.caption",
								)}
								copyright={t(
									"recommendations.duringEvent.inBuilding.image.copyright",
								)}
							/>
						</section>
						<section className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-4 md:order-2">
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
							<ImageComponent
								src="/imagery.png"
								alt={t("recommendations.duringEvent.traffic.image.alt")}
								className="w-full md:order-1"
								caption={t("recommendations.duringEvent.traffic.image.caption")}
								copyright={t(
									"recommendations.duringEvent.traffic.image.copyright",
								)}
							/>
						</section>
						<section className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-4">
								<h3 className="">
									{t("recommendations.duringEvent.heavyRain.title")}
								</h3>
								<ul className="list-disc space-y-2 pl-6">
									<li>{t("recommendations.duringEvent.heavyRain.item1")}</li>
								</ul>
							</div>
							<ImageComponent
								src="/imagery.png"
								alt={t("recommendations.duringEvent.traffic.image.alt")}
								className="w-full"
								caption={t("recommendations.duringEvent.traffic.image.caption")}
								copyright={t(
									"recommendations.duringEvent.traffic.image.copyright",
								)}
							/>
						</section>
						<section className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-4 md:order-2">
								<h3 className="">
									{t("recommendations.duringEvent.fluvialFlood.title")}
								</h3>
								<ul className="list-disc space-y-2 pl-6">
									<li>{t("recommendations.duringEvent.fluvialFlood.item1")}</li>
								</ul>
							</div>
							<ImageComponent
								src="/imagery.png"
								alt={t("recommendations.duringEvent.traffic.image.alt")}
								className="w-full md:order-1"
								caption={t("recommendations.duringEvent.traffic.image.caption")}
								copyright={t(
									"recommendations.duringEvent.traffic.image.copyright",
								)}
							/>
						</section>
					</div>
				</TabsContent>
				<TabsContent value="after">
					<div className="flex flex-col gap-6">
						<section className="flex flex-col gap-4">
							<h2 className="">
								{t("recommendations.afterEvent.personalPreparedness.title")}
							</h2>
							<p className="">
								{t("recommendations.afterEvent.personalPreparedness.item1")}
							</p>
							<p className="">
								{t("recommendations.afterEvent.personalPreparedness.item2")}
							</p>
							<p className="">
								{t("recommendations.afterEvent.personalPreparedness.item3")}
							</p>
							<p className="">
								{t("recommendations.afterEvent.personalPreparedness.item4")}
							</p>
							<ImageComponent
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
						</section>
						<section className="flex flex-col gap-4">
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
								<ImageComponent
									src="/imagery.png"
									alt={t("recommendations.afterEvent.inBuilding.image.alt")}
									className="w-full"
									caption={t(
										"recommendations.afterEvent.inBuilding.image.caption",
									)}
									copyright={t(
										"recommendations.afterEvent.inBuilding.image.copyright",
									)}
								/>
							</ul>
						</section>
						<section className="flex flex-col gap-4">
							<h3 className="">
								{t("recommendations.afterEvent.traffic.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.afterEvent.traffic.item1")}</li>
								<li>{t("recommendations.afterEvent.traffic.item2")}</li>
								<li>{t("recommendations.afterEvent.traffic.item3")}</li>
								<ImageComponent
									src="/imagery.png"
									alt={t("recommendations.afterEvent.traffic.image.alt")}
									className="w-full"
									caption={t(
										"recommendations.afterEvent.traffic.image.caption",
									)}
									copyright={t(
										"recommendations.afterEvent.traffic.image.copyright",
									)}
								/>
							</ul>
						</section>
						<section className="flex flex-col gap-4">
							<h3 className="">
								{t("recommendations.afterEvent.heavyRain.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.afterEvent.heavyRain.item1")}</li>
							</ul>
						</section>
						<section className="flex flex-col gap-4">
							<h3 className="">
								{t("recommendations.afterEvent.fluvialFlood.title")}
							</h3>
							<ul className="list-disc space-y-2 pl-6">
								<li>{t("recommendations.afterEvent.fluvialFlood.item1")}</li>
							</ul>
						</section>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
