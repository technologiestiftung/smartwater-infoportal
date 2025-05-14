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
	Image as BerlinImage,
} from "berlin-ui-library";
import Image from "next/image";
import Link from "next/link";
import IframeComponent from "./IFrameComponent";

const Results: React.FC = () => {
	const t = useTranslations("floodCheck");

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
		<div className="w-full max-w-[100vw] px-4">
			<h2 className="mt-6">{t("hazardAtLocation")}</h2>
			<div className="mt-2 flex w-full flex-col">
				<p className="">Placeholder Adresse</p>
				<p className="">Placeholder PLZ - Stadt</p>
			</div>
			<h3 className="mt-8">{t("hazardDisplay.title")}</h3>
			<p className="mt-2">{t("hazardDisplay.descriptionPlaceholder")}</p>
			<div className="mt-6 flex w-full max-w-full flex-nowrap gap-2 overflow-y-scroll">
				{filters.map((filter) => (
					<div className="flex border-2 border-black" key={filter}>
						<div className="flex h-12 w-12 items-center justify-center border-r-2 border-black bg-white">
							<Checkbox
								id={convertStringToID(filter)}
								variant="styled"
								className="h-5 w-5"
							/>
						</div>
						<div className="bg-red flex h-12 flex-1 items-center px-4 font-bold text-white">
							{filter}
						</div>
					</div>
				))}
			</div>
			<div className="mt-2 flex w-full max-w-full flex-nowrap gap-2 overflow-y-scroll">
				{subFilters.map((subFilter) => (
					<Toggle
						key={convertStringToID(subFilter)}
						aria-label="Toggle italic"
						variant="outline"
					>
						<span>{subFilter}</span>
					</Toggle>
				))}
			</div>
			<p className="mt-6">{t("hazardDisplay.frequencyDescription.rare")}</p>
			<Image
				className="mt-10 w-full max-w-[31.25rem]"
				src="/placeholder-images/Widget Starkregen.jpg"
				alt="Widget Starkregen"
				width={900}
				height={900}
			/>
			<h3 className="mt-10">{t("map.title")}</h3>
			<p className="mt-2">{t("map.description")}</p>
			<div className="mt-6">
				<IframeComponent url="https://smartwater-masterportal.netlify.app/smartwater-map/" />
			</div>
			<h2 className="mt-12">{t("hazardInfo.title")}</h2>
			<Accordion type="single" collapsible variant="default" className="mt-4">
				{accordion.map((item, index) => (
					<AccordionItem
						key={`item-${index}`}
						value={`item-${index}`}
						variant="default"
					>
						<AccordionTrigger variant="default">{item.title}</AccordionTrigger>
						<AccordionContent variant="default">
							{item.content}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
			<p className="mt-6">{t("hazardInfo.linkGroundwaterPortal")}</p>
			<Button variant="link">{t("hazardInfo.linkGeologicalPortal")}</Button>
			<p className="mt-6">{t("hazardInfo.linkWaterGeologyInfo")}</p>
			<Button variant="link">{t("hazardInfo.linkWaterGeologyBerlin")}</Button>
			<h2 className="mt-12">{t("floodCheckfloodCheck.title")}</h2>
			<p className="mt-4">{t("floodCheckfloodCheck.description")}</p>
			<Image
				className="mt-6 w-full max-w-[31.25rem]"
				src="/placeholder-images/Widget Risiko.jpg"
				alt="Widget Risiko"
				width={900}
				height={900}
			/>
			<h2 className="mt-12">{t("protectionTips.title")}</h2>
			<p className="mt-2">{t("protectionTips.intro1")}</p>
			<p className="mt-2">{t("protectionTips.intro2")}</p>
			<h2 className="mt-12">{t("protectionTips.inBuilding.title")}</h2>
			<ul className="list-inside list-disc">
				{inBuildingTipKeys.map((tipKey) => (
					<li key={tipKey} className="mt-2">
						{t(tipKey)}
					</li>
				))}
			</ul>
			<BerlinImage
				className="mt-12 w-full max-w-[31.25rem]"
				src="/imagery.png"
				alt="Placeholder Image"
				caption="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor."
				copyright="@copyright ungeklärt"
			/>
			<h2 className="mt-12">{t("protectionTips.traffic.title")}</h2>
			<ul className="list-inside list-disc">
				{trafficTipKeys.map((tipKey) => (
					<li key={tipKey} className="mt-2">
						{t(tipKey)}
					</li>
				))}
			</ul>
			<BerlinImage
				className="mt-12 w-full max-w-[31.25rem]"
				src="/imagery.png"
				alt="Placeholder Image"
				caption="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor."
				copyright="@copyright ungeklärt"
			/>
			<Link href="/">
				<Button className="mt-6">Übersicht Handlungsempfehlungen</Button>
			</Link>
			<div className="divider my-12" />
			<h3 className="mt-12">{t("reportDownload.title")}</h3>
			<p className="mt-2">{t("reportDownload.description")}</p>
			<p className="mt-2 block break-words text-sm leading-tight text-gray-600">
				PLACEHOLDER: Doctype: PDF-Dokument (39,6 kB) – Stand: 02/2025
			</p>
			<Button variant="download" className="mb-14 mt-4">
				Bericht herunterladen
			</Button>
		</div>
	);
};

export default Results;
