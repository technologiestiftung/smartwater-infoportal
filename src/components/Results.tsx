import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
	Button,
	Image,
	Pill,
	FilterPillGroup,
	Tabs,
	TabsTrigger,
	TabsList,
	DownloadItem,
} from "berlin-ui-library";
import IframeComponent from "./IFrameComponent";
import { useRouter, useSearchParams } from "next/navigation";
import TextBlock from "./TextBlock";
import RiskBlock from "./RiskBlock";
import useStore from "@/store/defaultStore";

const Results: React.FC = () => {
	const t = useTranslations("floodCheck");
	const router = useRouter();
	const searchParams = useSearchParams();
	const skip = searchParams.get("skip");

	const filters = ["Starkregen", "Flusshochwasser"];
	const subFilters = ["Selten", "Außergewöhnlich", "Extrem"];
	const accordion = [
		{
			title: t("hazardInfo.calculation"),
			content: t("hazardDisplay.descriptionPlaceholder"),
		},
		{
			title: t("hazardInfo.learnMore"),
			content: t("hazardDisplay.descriptionPlaceholder"),
		},
		{
			title: t("hazardInfo.mapInfo"),
			content: t("hazardInfo.mapDisclaimer"),
		},
	];
	const inBuildingTipKeys = [
		"protectionTips.inBuilding.tip1",
		"protectionTips.inBuilding.tip2",
		"protectionTips.inBuilding.tip3",
		"protectionTips.inBuilding.tip4",
		"protectionTips.inBuilding.tip5",
	];
	const trafficTipKeys = [
		"protectionTips.traffic.tip1",
		"protectionTips.traffic.tip2",
		"protectionTips.traffic.tip3",
		"protectionTips.traffic.tip4",
		"protectionTips.traffic.tip5",
	];
	const [activeFilters, setActiveFilters] = useState<string[]>([]);
	const handleFilterToggle = (value: string) => {
		setActiveFilters((prev) =>
			prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
		);
	};
	const convertStringToID = (str: string) => {
		return str.replace(/\s+/g, "-").toLowerCase();
	};

	const currentUserAddress = useStore((state) => state.currentUserAddress);

	return (
		<div className="flex w-full flex-col gap-12 pt-2">
			<section className="flex flex-col gap-2">
				{currentUserAddress && (
					<>
						<h2 className="">{t("hazardAtLocation")}</h2>
						<div className="flex w-full flex-col">
							<p className="">{currentUserAddress}</p>
						</div>
					</>
				)}
			</section>
			<section className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<h3 className="">{t("hazardDisplay.title")}</h3>
					<p className="">{t("hazardDisplay.descriptionPlaceholder")}</p>
				</div>
				<div className="flex flex-col gap-2">
					<div className="flex">
						<Tabs defaultValue={convertStringToID(filters[0])}>
							<TabsList variant="module">
								{filters.map((filter) => (
									<TabsTrigger
										key={convertStringToID(filter)}
										variant="module"
										className="capitalize"
										value={convertStringToID(filter)}
									>
										<h4>{convertStringToID(filter)}</h4>
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
					<div className="flex w-full">
						<FilterPillGroup
							activeValues={activeFilters}
							onValueToggle={handleFilterToggle}
						>
							{subFilters.map((subFilter) => (
								<Pill
									variant="filter"
									value={convertStringToID(subFilter)}
									key={convertStringToID(subFilter)}
									className="capitalize"
								>
									{convertStringToID(subFilter)}
								</Pill>
							))}
						</FilterPillGroup>
					</div>
				</div>

				<TextBlock
					desktopColSpans={{ col1: 1, col2: 1 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<p className="bg-panel-heavy p-6">
							{t("hazardDisplay.frequencyDescription.rare")}
						</p>
					}
					slotB={
						<div id="starkregen-widget">
							<Image
								className="w-full"
								src="/placeholder-images/Widget Starkregen.jpg"
								alt="Widget Starkregen"
							/>
						</div>
					}
				/>
				<h3 className="mt-2">{t("map.title")}</h3>
				<p className="">{t("map.description")}</p>
				<div id="smartwater-map">
					<IframeComponent
						url={
							window.location.href.includes("localhost")
								? "http://localhost:3000/"
								: "https://smartwater-masterportal.netlify.app/smartwater-map/"
						}
						height="h-[700px]"
					/>
				</div>
			</section>
			<section className="flex flex-col gap-4">
				<h2 className="">{t("hazardInfo.title")}</h2>
				<Accordion
					type="single"
					collapsible
					variant="default"
					className="text-start"
				>
					{accordion.map((item, index) => (
						<AccordionItem
							key={`item-${index}`}
							value={`item-${index}`}
							variant="default"
						>
							<AccordionTrigger variant="default">
								{item.title}
							</AccordionTrigger>
							<AccordionContent variant="default">
								{item.content}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
				<div className="flex flex-col">
					<span className="">{t("hazardInfo.linkGroundwaterPortal")}</span>
					<Button variant="link">{t("hazardInfo.linkGeologicalPortal")}</Button>
				</div>
				<div className="flex flex-col">
					<span className="">{t("hazardInfo.linkWaterGeologyInfo")}</span>
					<Button variant="link">
						{t("hazardInfo.linkWaterGeologyBerlin")}
					</Button>
				</div>
			</section>
			{!skip && (
				<>
					<div className="divider" />
					<section className="flex flex-col gap-4">
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("floodCheckfloodCheck.title")}</h2>
							<p className="">{t("floodCheckfloodCheck.description")}</p>
						</div>
						<TextBlock
							desktopColSpans={{ col1: 1, col2: 1 }}
							className="w-full gap-6"
							reverseDesktopColumns={true}
							slotA={
								<div className="bg-panel-heavy flex w-full flex-col gap-6 p-6">
									<h3 className="">{t("floodCheckfloodCheck.title")}</h3>
									<p className="">{t("floodCheckfloodCheck.description")}</p>
								</div>
							}
							slotB={<RiskBlock />}
						/>
					</section>
				</>
			)}
			<section className="flex w-full flex-col gap-12">
				{!skip && (
					<>
						<div className="flex flex-col gap-2">
							<h2 className="">{t("protectionTips.title")}</h2>
							<p className="">{t("protectionTips.intro1")}</p>
							<p className="mt-4">{t("protectionTips.intro2")}</p>
						</div>

						<div className="flex flex-col gap-2">
							<TextBlock
								desktopColSpans={{ col1: 1, col2: 1 }}
								className="w-full gap-6"
								slotA={
									<div className="flex h-full w-full flex-col p-6">
										<h2 className="">{t("protectionTips.inBuilding.title")}</h2>
										<ul className="list-inside list-disc">
											{inBuildingTipKeys.map((tipKey) => (
												<li key={tipKey} className="mt-2">
													{t(tipKey)}
												</li>
											))}
										</ul>{" "}
									</div>
								}
								slotB={
									<Image
										className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
										src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_3.png"
										alt={t("protectionTips.inBuilding.image.alt")}
										caption={t("protectionTips.inBuilding.image.caption")}
										copyright={t("protectionTips.inBuilding.image.copyright")}
									/>
								}
							/>
						</div>
					</>
				)}

				<div className="flex flex-col gap-2">
					{!skip && (
						<>
							<TextBlock
								desktopColSpans={{ col1: 1, col2: 1 }}
								className="w-full gap-6"
								reverseDesktopColumns={true}
								slotA={
									<div className="flex h-full w-full flex-col p-6">
										<h2 className="">{t("protectionTips.traffic.title")}</h2>
										<ul className="list-inside list-disc">
											{trafficTipKeys.map((tipKey) => (
												<li key={tipKey} className="mt-2">
													{t(tipKey)}
												</li>
											))}
										</ul>
									</div>
								}
								slotB={
									<Image
										className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
										src="/A3_Schutzmaßnahmen_Schutzmaßnahmen_8.png"
										alt={t("protectionTips.traffic.image.alt")}
										caption={t("protectionTips.traffic.image.caption")}
										copyright={t("protectionTips.traffic.image.copyright")}
									/>
								}
							/>
							<Button
								className="mt-6 w-full self-start lg:w-fit"
								onClick={() => {
									router.push("/handlungsempfehlungen");
								}}
							>
								Übersicht Handlungsempfehlungen
							</Button>
						</>
					)}
					<div className="divider mt-4" />
					<DownloadItem
						buttonText="Download Bericht"
						date="03/1974"
						description={t("reportDownload.description")}
						downloadUrl="#"
						fileType="PLACEHOLDER: Doctype: PDF-Dokument (39,6 kB) – Stand: 02/2025"
						title={t("reportDownload.title")}
					/>
				</div>
			</section>
		</div>
	);
};

export default Results;
