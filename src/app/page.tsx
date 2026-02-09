"use client";
import { useState } from "react";
import TextBlock from "@/components/TextBlock";
import Warning from "@/components/Warning";
import { Button, Image } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import AddressSearch from "../components/AddressSearch";
import useStore from "@/store/defaultStore";

export default function Home() {
	const t = useTranslations("home");
	const router = useRouter();
	const resetAll = useStore((state) => state.resetAll);
	const [loading, setLoading] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const locationData = useStore((state) => state.locationData);
	const isDev = process.env.NODE_ENV === "development";
	const isDP =
		typeof window !== "undefined" &&
		window.location.toString().includes("deploy-preview-59");

	return (
		<div className="flex w-full flex-col gap-12 px-5 py-8 lg:px-0">
			<section>
				<div className="flex flex-col gap-6">
					<h1 className="">{t("pageTitle")}</h1>
				</div>
			</section>
			{(isDev || isDP) && (
				<>
					<div className="flex flex-col gap-4">
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
						<Button
							onClick={async () => {
								setLoading(true);
								const url = `${window.location.origin}/scenario-map?scenario=SR&lat=52.574631486656095&lon=13.40516359545076`;
								const res = await fetch("/api/scenario-map-screenshot", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										url,
										buildingGeometry: locationData?.building?.geometry,
										outlineBufferGeometry:
											locationData?.building?.outlineBufferGeometry,
									}),
								});

								const text = await res.text();

								if (!res.ok) {
									return window.alert(
										`Screenshot API failed (${res.status}): ${text}`,
									);
									// throw new Error(`Screenshot API failed (${res.status}): ${text}`);
								}

								const data = JSON.parse(text);
								const { imageBase64 } = data;
								const dataUrl = `data:image/jpeg;base64,${imageBase64}`;
								const blob = await fetch(dataUrl).then((r) => r.blob());
								const urlMG = URL.createObjectURL(blob);
								setPreview(urlMG);
								setLoading(false);
								return data;
							}}
						>
							{loading
								? "Screenshot wird erstellt…"
								: "Screenshot des Szenario-Maps erstellen"}
						</Button>
					</div>
					{preview && (
						<img
							src={preview}
							alt="Preview"
							style={{ maxWidth: "100%", height: "auto" }}
						/>
					)}
				</>
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
