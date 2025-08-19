"use client";
import TextBlock from "@/components/TextBlock";
import Warning from "@/components/Warning";
import { Button, Image } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import AddressSearch from "../components/AddressSearch";

export default function Home() {
	const t = useTranslations("home");
	const router = useRouter();

	return (
		<div className="flex w-full flex-col gap-12 px-5 py-8 lg:px-0">
			<section>
				<div className="flex flex-col gap-6">
					<h1 className="">{t("pageTitle")}</h1>
					<p className="">{t("whatIsIt.description1")}</p>
					<p className="">{t("whatIsIt.description2")}</p>
				</div>
			</section>
			<div className="divider px-5" />
			<section className="flex flex-col gap-6">
				<h2 className="">{t("amIAffected.title")}</h2>
				<p className="">{t("amIAffected.description")}</p>
				<p className="">{t("amIAffected.cta")}</p>
				<AddressSearch onLandingPage />
			</section>
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
							src="/A1_heller.png"
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
							src="/A2_heller.png"
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
									router.push("/allgemeine-informationen");
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
