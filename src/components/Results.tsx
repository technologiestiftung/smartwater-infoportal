import React, { useEffect, useState } from "react";
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
	DownloadItem,
	List,
	ListItem,
} from "berlin-ui-library";
import { useRouter, useSearchParams } from "next/navigation";
import TextBlock from "./TextBlock";
import RiskBlock from "./RiskBlock";
import ResultBlock from "./ResultBlock";
import useStore from "@/store/defaultStore";
import floodRiskConfig from "@/config/floodRiskConfig.json";
import Map from "./Map/Map";
import Link from "next/link";
import ErrorCatcher from "./ErrorCatcher";

const Results: React.FC = () => {
	const t = useTranslations("floodCheck");
	const router = useRouter();
	const getHazardEntities = useStore((state) => state.getHazardEntities);
	const floodRiskAnswers = useStore((state) => state.floodRiskAnswers);
	const floodRiskResult = useStore((state) => state.floodRiskResult);
	const searchParams = useSearchParams();
	const skip = searchParams.get("skip");

	const hazardEntities = getHazardEntities();

	// Define filter keys for translation
	const filterKeys = [
		{ key: "heavyRain", translationKey: "hazardDisplay.heavyRainTab" },
		{ key: "fluvialFlood", translationKey: "hazardDisplay.fluvialFloodTab" },
	];
	const subFilterKeys = [
		{ key: "rare", translationKey: "hazardDisplay.frequency.rare" },
		{ key: "uncommon", translationKey: "hazardDisplay.frequency.uncommon" },
		{ key: "extreme", translationKey: "hazardDisplay.frequency.extreme" },
	];
	const accordion = [
		{
			title: t("hazardInfo.calculation"),
			content: t("hazardDisplay.descriptionPlaceholder"),
		},
		{
			title: t("hazardInfo.disclaimerTitle"),
			content: t("hazardInfo.disclaimerText"),
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
	const [activeFilter, setActiveFilter] = useState<string>(filterKeys[0].key);
	const updateActiveMapFilter = useStore(
		(state) => state.updateActiveMapFilter,
	);
	const activeMapFilter = useStore((state) => state.activeMapFilter);
	const handleFilterToggle = (value: string) => {
		updateActiveMapFilter(value);
		setActiveFilter(value);
	};
	const [activeSubFilter, setActiveSubFilter] = useState<string>(
		subFilterKeys[0].key,
	);
	const handleSubFilterToggle = (value: string) => {
		setActiveSubFilter(value);
	};
	// Filter hazard entities based on active filter
	const getFilteredHazardEntities = () => {
		if (!hazardEntities) {
			return null;
		}

		// Filter entities based on the single active filter
		return hazardEntities.filter((entity) => entity.name === activeFilter);
	};

	const currentUserAddress = useStore((state) => state.currentUserAddress);

	const HazardTranslations = () => {
		const text = t(
			`hazardDisplay.frequencyDescription.${activeSubFilter}.text`,
		);
		const waterLevel = t(
			`hazardDisplay.frequencyDescription.${activeSubFilter}.waterLevel`,
		);
		const flowVelocity = t(
			`hazardDisplay.frequencyDescription.${activeSubFilter}.flowVelocity`,
		);

		const shouldRender =
			text &&
			waterLevel &&
			flowVelocity &&
			text !== `hazardDisplay.frequencyDescription.${activeSubFilter}.text` &&
			waterLevel !==
				`hazardDisplay.frequencyDescription.${activeSubFilter}.waterLevel` &&
			flowVelocity !==
				`hazardDisplay.frequencyDescription.${activeSubFilter}.flowVelocity`;

		console.warn("shouldRender :>> ", shouldRender);

		if (!shouldRender) {
			console.warn("Missing translations for:", {
				text,
				waterLevel,
				flowVelocity,
			});
			return null;
		}

		return (
			<div className="bg-panel-heavy p-6">
				<p className="mb-4">{text}</p>
				<List variant="unordered">
					<ListItem>{waterLevel}</ListItem>
					<ListItem>{flowVelocity}</ListItem>
				</List>
			</div>
		);
	};

	useEffect(() => {
		if (activeMapFilter !== activeFilter) {
			updateActiveMapFilter(activeFilter);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex w-full flex-col gap-12 pt-2">
			<ErrorCatcher name="Section 1">
				<section className="flex flex-col gap-2">
					{currentUserAddress && (
						<div className="flex w-full flex-col">
							<p className="">{currentUserAddress.display_name}</p>
						</div>
					)}
				</section>
			</ErrorCatcher>
			<section className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<h3 className="">{t("hazardDisplay.title")}</h3>
					{/* <p className="">{t("hazardDisplay.descriptionPlaceholder")}</p> */}
				</div>
				<ErrorCatcher name="FilterPillGroup">
					<div className="flex flex-col gap-2">
						<div className="flex">
							<FilterPillGroup
								size="xl"
								showIcon={false}
								activeValues={[activeFilter]}
								onValueToggle={handleFilterToggle}
							>
								{filterKeys.map((filter) => (
									<Pill
										variant="filter-outline"
										size="xl"
										showIcon={false}
										value={filter.key}
										key={filter.key}
										className="capitalize"
									>
										{t(filter.translationKey)}
									</Pill>
								))}
							</FilterPillGroup>
						</div>
						<div className="flex w-full">
							<FilterPillGroup
								activeValues={[activeSubFilter]}
								onValueToggle={handleSubFilterToggle}
							>
								{subFilterKeys.map((subFilter) => (
									<Pill
										variant="filter"
										value={subFilter.key}
										key={subFilter.key}
										className="capitalize"
									>
										{t(subFilter.translationKey)}
									</Pill>
								))}
							</FilterPillGroup>
						</div>
					</div>
				</ErrorCatcher>

				<TextBlock
					desktopColSpans={{ col1: 1, col2: 1 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<ErrorCatcher name="TextBlock-SlotA">
							<HazardTranslations />
						</ErrorCatcher>
					}
					slotB={
						<ErrorCatcher name="TextBlock-SlotB">
							<div>
								{(() => {
									const filteredEntities = getFilteredHazardEntities();

									if (filteredEntities && filteredEntities.length > 0) {
										return (
											<div className="">
												{filteredEntities.map((entity) => (
													<ResultBlock
														key={entity.name}
														entity={entity.name}
														hazardLevel={entity.hazardLevel}
														showSubLabel={entity.showSubLabel || false}
														subHazardLevel={entity.subHazardLevel}
													/>
												))}
											</div>
										);
									}

									return <p className="">{t("noHazardData")}</p>;
								})()}
							</div>
						</ErrorCatcher>
					}
				/>
				<h3 className="mt-2">{t("map.title")}</h3>
				<p className="">{t("map.description")}</p>
				<ErrorCatcher name="Map">
					<Map />
				</ErrorCatcher>
			</section>
			<ErrorCatcher name="Section 2">
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
									{index === 2 && (
										<>
											<div className="mt-4 flex flex-col">
												<span className="">
													{t("hazardInfo.linkGroundwaterPortalTitle")}
												</span>
												<Link
													href={t("hazardInfo.linkGroundwaterPortalLink")}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button variant="link">
														{t("hazardInfo.linkGroundwaterPortalLinkTitle")}
													</Button>
												</Link>
											</div>
											<div className="flex flex-col">
												<span className="">
													{t("hazardInfo.linkWaterGeologyTitle")}
												</span>
												<Link
													href={t("hazardInfo.linkWaterGeologyLink")}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button variant="link">
														{t("hazardInfo.linkWaterGeologyLinkTitle")}
													</Button>
												</Link>
											</div>
										</>
									)}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</section>
			</ErrorCatcher>
			<ErrorCatcher name="HazardEntities">
				<>
					{!skip && hazardEntities && hazardEntities.length > 0 && (
						<>
							<div className="divider" />
							<section className="flex flex-col gap-4">
								<div className="flex w-full flex-col gap-6">
									<h2 className="">{t("buildingRiskAssessment.title")}</h2>
									<p className="">{t("buildingRiskAssessment.description1")}</p>
									<p className="">{t("buildingRiskAssessment.description2")}</p>
								</div>
								<TextBlock
									desktopColSpans={{ col1: 1, col2: 1 }}
									className="w-full gap-6"
									reverseDesktopColumns={true}
									slotA={
										<div className="bg-panel-heavy flex w-full flex-col gap-6 p-6">
											<h3 className="">{t("buildingRiskAssessment.title")}</h3>
											<p className="">
												{t("buildingRiskAssessment.description1")}
											</p>
											<p className="">
												{t("buildingRiskAssessment.description2")}
											</p>
										</div>
									}
									slotB={
										<RiskBlock
											floodRiskAnswers={floodRiskAnswers}
											value={floodRiskResult?.totalScore}
											min={floodRiskConfig.riskThresholds.low.max}
											max={floodRiskConfig.riskThresholds.high.min}
										/>
									}
								/>
							</section>
						</>
					)}
				</>
			</ErrorCatcher>
			<ErrorCatcher name="Section 3">
				<section className="flex w-full flex-col gap-12">
					{!skip && hazardEntities && hazardEntities.length > 0 && (
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
											<h2 className="">
												{t("protectionTips.inBuilding.title")}
											</h2>
											<ul className="list-inside list-disc">
												{inBuildingTipKeys.map((tipKey) => (
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
			</ErrorCatcher>
		</div>
	);
};

export default Results;
