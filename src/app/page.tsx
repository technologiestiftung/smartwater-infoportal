"use client";
import TextBlock from "@/components/TextBlock";
import Warning from "@/components/Warning";
import { Button, Image } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import AddressSearch from "../components/AddressSearch";
import useStore from "@/store/defaultStore";
import pdfData from "@/components/Report/pdf.json";
import { drawPDF } from "@/components/Report/pdf";
import { PDFProps } from "@/components/Report/types";
import { getToday } from "@/components/Report/utils";

export default function Home() {
	const t = useTranslations("home");
	const router = useRouter();
	const resetAll = useStore((state) => state.resetAll);
	const isDev = process.env.NODE_ENV === "development";

	const pdfKeys: Record<string, string | number | boolean> = {
		"{date}": getToday(),
		"{address}": "Musterstraße 1, 10115 Berlin",
		"{hazardLevelHeavyRain}": "Keine Daten",
		"{hazardLevelfloodRisk}": "Keine Daten",
		"{showRareHeavyRain}": true, // !!buildingWMSData?.maxRareHeavyRain;
		"{maxRareHeavyRain}": "Keine Daten", // buildingWMSData?.maxRareHeavyRain
		"{hasSrgkUncommonHeavyRainMap}": false, // !!buildingWMSData.hasHeavyRainHazardMap
		"{maxUncommonHeavyRain}": "Keine Daten", // buildingWMSData?.maxUncommonHeavyRain
		"{hasSrgkExtremeHeavyRainMap}": false, // buildingWMSData.hasHeavyRainHazardMap === "isInExtremeRainHazardMap"
		"{maxExtremeHeavyRain}": "Keine Daten", // !!buildingWMSData.maxExtremeHeavyRain
		"{hasFloodHazardData}": false, // one of the flood map data exists && no Überschwemmungsgebiet
		"{maxFrequentFlood}": "Keine Daten",
		"{maxAverageFlood}": "Keine Daten",
		"{maxRareFlood}": "Keine Daten",
		"{skip}": false, // !!skip
		"{basementHazardTag}": "/Red.png",
		"{highBasementHazard}": true,
		"{midBasementHazard}": false,
		"{lowBasementHazard}": false,
		"{dontKnowBasementHazard}": false,
		"{basementUsageTag}": "/Grey.png",
		"{noBasementUsageHazard}": false,
		"{highBasementUsageHazard}": false,
		"{midBasementUsageHazard}": true,
		"{backflowPreventionTag}": "/Green.png",
		"{highBackflowPrevention}": false,
		"{midBackflowPrevention}": false,
		"{lowBackflowPrevention}": false,
		"{dontKnowBackflowPrevention}": true,
		"{propertyDrainageTag}": "/Orange.png",
		"{noPropertyDrainageHazard}": false,
		"{highPropertyDrainageHazard}": false,
		"{lowPropertyDrainageHazard}": true,
		"{pastDamagesTag}": "/Orange.png",
		"{noPastDamages}": false,
		"{highPastDamages}": false,
		"{lowPastDamages}": true,
		"{floodZoneTag}": "/Green.png",
		"{highFloodZone}": false,
		"{lowFloodZone}": true,
		"{fluvialFloodTag}": "/Green.png",
		"{highFluvialFlood}": false,
		"{midFluvialFlood}": false,
		"{lowFluvialFlood}": true,
		"{heavyRainTag}": "/Green.png",
		"{highHeavyRain}": false,
		"{midHeavyRain}": true,
		"{lowHeavyRain}": false,
		"{basementWithWindows}": true,
		"{basementWithoutWindows}": true,
	};

	return (
		<div className="flex w-full flex-col gap-12 px-5 py-8 lg:px-0">
			<section>
				<div className="flex flex-col gap-6">
					<h1 className="">{t("pageTitle")}</h1>
				</div>
			</section>
			{isDev && (
				<div className="flex flex-col gap-4">
					<Button
						onClick={async () => {
							const pdfBlobCreated = await drawPDF(
								pdfData as PDFProps,
								pdfKeys,
							);
							if (!pdfBlobCreated?.blob) {
								window.alert("PDF konnte nicht erstellt werden.");
								return;
							}
							const url = URL.createObjectURL(pdfBlobCreated.blob);
							window.open(url, "_blank");
							setTimeout(() => {
								URL.revokeObjectURL(url);
							}, 2000);
						}}
					>
						Test PDF
					</Button>
					<Button
						onClick={() => {
							resetAll();
							setTimeout(() => {
								window.location.reload();
							}, 500);
						}}
					>
						Alles zurücksetzen
					</Button>
				</div>
			)}
			<section className="w-full">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex flex-col gap-6">
							<p className="">{t("whatIsIt.description1")}</p>
							<p className="">{t("whatIsIt.description2")}</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/title.png"
							alt={t("howToProtect.titleImage.alt")}
							caption={t("howToProtect.titleImage.caption")}
							copyright={t("howToProtect.titleImage.copyright")}
						/>
					}
				/>
			</section>
			<div
				className="divider scroll-mt-[62px] px-5 lg:scroll-mt-[85px]"
				id="hochwasser-check"
			/>
			<section className="flex flex-col gap-6">
				<h2 className="">{t("amIAffected.title")}</h2>
				<p className="">{t("amIAffected.description")}</p>
				<p className="">{t("amIAffected.cta")}</p>
				<AddressSearch />
			</section>
			<div className="divider px-5" />
			<section className="w-full">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<div className="flex flex-col gap-2">
								<h2 className="">{t("howToProtect.title")}</h2>
								<p className="">{t("howToProtect.ownerInfo")}</p>
							</div>
							<p className="">{t("howToProtect.tenantInfo")}</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/A1_heller.jpg"
							alt={t("howToProtect.image_A1.alt")}
							caption={t("howToProtect.image_A1.caption")}
							copyright={t("howToProtect.image_A1.copyright")}
						/>
					}
					slotC={
						<div className="flex w-full flex-col gap-6">
							<p className="">{t("howToProtect.recommendations.info")}</p>
							<Button
								className="w-full self-start lg:w-fit"
								onClick={() => {
									router.push("/handlungsempfehlungen");
								}}
							>
								{t("howToProtect.recommendations.button")}
							</Button>
						</div>
					}
				/>
			</section>
			<div className="divider" />
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 3, col2: 2 }}
					className="w-full gap-6"
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("floodRadar.title")}</h2>
						</div>
					}
					slotB={
						<div className="flex h-full items-center">
							<Warning />
						</div>
					}
					slotC={<div className="">{t.rich("floodRadar.description")}</div>}
				/>
			</section>
			<div className="divider" />
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("backgroundInfo.title")}</h2>
							<p className="">{t("backgroundInfo.questions")}</p>
							<p className="">{t("backgroundInfo.answer")}</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/A2_heller.jpg"
							alt={t("howToProtect.image_A2.alt")}
							caption={t("howToProtect.image_A2.caption")}
							copyright={t("howToProtect.image_A2.copyright")}
						/>
					}
					slotC={
						<div className="flex w-full flex-col gap-6">
							<Button
								className="w-full self-start lg:w-fit"
								onClick={() => {
									router.push("/hintergrund-informationen");
								}}
							>
								{t("backgroundInfo.button")}
							</Button>
						</div>
					}
				/>
			</section>
		</div>
	);
}
