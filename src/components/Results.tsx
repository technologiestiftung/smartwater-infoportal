import React from "react";
import { useTranslations } from "next-intl";
import {
	Checkbox,
	Toggle,
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
	Button,
	Image,
} from "berlin-ui-library";
import IframeComponent from "./IFrameComponent";
import { useRouter } from "next/navigation";
import TextBlock from "./TextBlock";
import RiskBlock from "./RiskBlock";

const Results: React.FC = () => {
	const t = useTranslations("floodCheck");
	const router = useRouter();

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

	const convertStringToID = (str: string) => {
		return str.replace(/\s+/g, "-").toLowerCase();
	};

	return (
		<div className="flex w-full flex-col gap-12">
			<section className="flex flex-col gap-2">
				<h2 className="">{t("hazardAtLocation")}</h2>
				<div className="flex w-full flex-col">
					<p className="">Placeholder Adresse</p>
					<p className="">Placeholder PLZ - Stadt</p>
				</div>
			</section>
			<section className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<h3 className="">{t("hazardDisplay.title")}</h3>
					<p className="">{t("hazardDisplay.descriptionPlaceholder")}</p>
				</div>
				<div className="flex flex-col gap-2">
					<div className="flex w-full gap-2 overflow-y-scroll">
						{filters.map((filter) => (
							<div className="flex w-1/2 border-2 border-black" key={filter}>
								<div className="flex h-12 min-w-12 items-center justify-center border-r-2 border-black bg-white">
									<Checkbox
										id={convertStringToID(filter)}
										variant="styled"
										className="h-5 min-w-5"
									/>
								</div>
								<div className="bg-red flex h-12 flex-1 items-center px-4 font-bold text-white">
									{filter}
								</div>
							</div>
						))}
					</div>
					<div className="flex w-full gap-2 overflow-y-scroll">
						{subFilters.map((subFilter) => (
							<Toggle
								key={convertStringToID(subFilter)}
								aria-label="Toggle italic"
								className="w-1/3"
								variant="outline"
							>
								<span>{subFilter}</span>
							</Toggle>
						))}
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
						<Image
							className="w-full"
							src="/placeholder-images/Widget Starkregen.jpg"
							alt="Widget Starkregen"
						/>
					}
				/>

				<h3 className="mt-2">{t("map.title")}</h3>
				<p className="">{t("map.description")}</p>
				<div className="">
					<IframeComponent url="https://smartwater-masterportal.netlify.app/smartwater-map/" />
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
			<section className="flex w-full flex-col gap-12">
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
								className="-mx-5 mt-6 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/imagery.png"
								alt="Placeholder Image"
								caption="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor."
								copyright="@copyright ungeklärt"
							/>
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
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
								className="-mx-5 mt-6 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/imagery.png"
								alt="Placeholder Image"
								caption="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor."
								copyright="@copyright ungeklärt"
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
				</div>
			</section>
			<div className="divider" />
			<section className="flex flex-col gap-4">
				<h3 className="">{t("reportDownload.title")}</h3>
				<p className="">{t("reportDownload.description")}</p>
				<p className="block break-words text-sm leading-tight text-gray-600">
					PLACEHOLDER: Doctype: PDF-Dokument (39,6 kB) – Stand: 02/2025
				</p>
				<Button variant="download" className="w-full self-start lg:w-fit">
					Bericht herunterladen
				</Button>
			</section>
		</div>
	);
};

export default Results;
