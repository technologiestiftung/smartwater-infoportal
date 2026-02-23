import useStore from "@/store/defaultStore";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	FilterPillGroup,
	List,
	ListItem,
	Pill,
} from "berlin-ui-library";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ErrorCatcher from "./ErrorCatcher";
import EvaluationTesting from "./EvaluationTesting";
import Map from "./Map/Map";
import ReportPDF from "./Report/components/ReportPDF";
import ResultBlock from "./ResultBlock";
import RiskBlock from "./RiskBlock";
import TextBlock from "./TextBlock";

const Results: React.FC = () => {
	const t = useTranslations("floodCheck");
	const router = useRouter();
	const {
		interactiveMap: { activeMapFilter },
		updateInteractiveMap,
		getHazardEntities,
		locationData,
	} = useStore();
	const searchParams = useSearchParams();
	const skip = searchParams.get("skip");
	const hazardEntities = getHazardEntities();
	const isDev = process.env.NODE_ENV === "development";
	const showMap = !isDev;

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
	const [activeFilter, setActiveFilter] = useState<string>(filterKeys[0].key);

	const handleFilterToggle = (value: string) => {
		if (value === "heavyRain" || value === "fluvialFlood") {
			updateInteractiveMap({ activeMapFilter: value });
			setActiveFilter(value);
		}
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

		if (!shouldRender) {
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
		if (
			activeMapFilter !== activeFilter &&
			!!activeFilter &&
			(activeFilter === "heavyRain" || activeFilter === "fluvialFlood")
		) {
			updateInteractiveMap({ activeMapFilter: activeFilter });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex w-full flex-col gap-12 pt-4">
			<section className="flex items-center gap-2">
				{locationData?.found && (
					<>
						<FontAwesomeIcon
							icon={faLocationDot}
							className="text-[18px] text-black"
						/>
						<p className="mt-[3px]">{locationData.building?.name}</p>
					</>
				)}
			</section>
			<section className="flex flex-col gap-4">
				<div className="flex flex-col gap-2"></div>
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

				<TextBlock
					desktopColSpans={{ col1: 1, col2: 1 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={<HazardTranslations />}
					slotB={
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
					}
				/>
				{showMap && (
					<>
						<h3 className="mt-2">{t("map.title")}</h3>
						<p className="">{t("map.description")}</p>
						<Map />
					</>
				)}
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
								<h3>{item.title}</h3>
							</AccordionTrigger>
							<AccordionContent variant="default">
								<p>{item.content}</p>
								{index === 2 && (
									<>
										<div className="mt-4 flex flex-col">
											<p className="">
												{t("hazardInfo.linkGroundwaterPortalTitle")}
											</p>
											<Link
												href={t("hazardInfo.linkGroundwaterPortalLink")}
												target="_blank"
												rel="noopener noreferrer"
											>
												<Button variant="link">
													<p className="">
														{t("hazardInfo.linkGroundwaterPortalLinkTitle")}
													</p>
												</Button>
											</Link>
										</div>
										<div className="flex flex-col">
											<p className="">
												{t("hazardInfo.linkWaterGeologyTitle")}
											</p>
											<Link
												href={t("hazardInfo.linkWaterGeologyLink")}
												target="_blank"
												rel="noopener noreferrer"
											>
												<Button variant="link">
													<p className="">
														{t("hazardInfo.linkWaterGeologyLinkTitle")}
													</p>
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
			{!skip && hazardEntities && hazardEntities.length > 0 && (
				<>
					<div className="divider" />
					<section className="flex flex-col gap-4">
						<div className="mb-6 flex w-full flex-col">
							<h2 className="">{t("buildingRiskAssessment.title")}</h2>
						</div>
						<TextBlock
							desktopColSpans={{ col1: 1, col2: 1 }}
							className="w-full gap-6"
							reverseDesktopColumns={true}
							slotA={
								<div className="flex w-full flex-col gap-6 bg-panel-heavy p-6">
									<h3 className="">
										{t("buildingRiskAssessment.disclaimerTitle")}
									</h3>
									<p className="">{t("buildingRiskAssessment.description1")}</p>
								</div>
							}
							slotB={<RiskBlock />}
						/>
						{isDev && <EvaluationTesting />}
					</section>
				</>
			)}
			<section className="flex w-full flex-col gap-12" id="protection-tips">
				{!skip && hazardEntities && hazardEntities.length > 0 && (
					<>
						<div className="flex flex-col gap-2">
							<h2 className="">{t("protectionTips.title")}</h2>
							<p className="">{t("protectionTips.intro1")}</p>
						</div>
						<Button
							className="w-full self-start lg:w-fit"
							onClick={() => {
								router.push("/handlungsempfehlungen");
							}}
						>
							{t("protectionTips.recommendationsOverview.button")}
						</Button>
						<p className="">{t("protectionTips.intro2")}</p>
					</>
				)}
			</section>
			<section>
				<div className="divider mt-4" />
				<ErrorCatcher name="ReportPDF">
					<ReportPDF skip={skip} />
				</ErrorCatcher>
			</section>
		</div>
	);
};

export default Results;
