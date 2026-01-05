"use client";
import TextBlock from "@/components/TextBlock";
import Warning from "@/components/Warning";
import { Button, DownloadItem, Image } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import AddressSearch from "../components/AddressSearch";
import useStore from "@/store/defaultStore";
import { useEffect, useRef, useState } from "react";
import {
	createPDF,
	getToday,
	PDFProps,
} from "@/components/DownloadPDF/pdfUtilsNew";
import pdfData from "@/components/DownloadPDF/pdf.json";

export default function Home() {
	const t = useTranslations("home");
	const router = useRouter();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const resetAll = useStore((state) => state.resetAll);
	const showTestingFeatures = useStore((state) => state.showTestingFeatures);
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper || !pdfBlob) {
			return () => {};
		}

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const clickedButton = target.closest("button");

			if (clickedButton && wrapper.contains(clickedButton)) {
				const url = URL.createObjectURL(pdfBlob);
				window.open(url, "_blank");
				/* const a = document.createElement("a");
				a.href = url;
				a.download = "Report-HochwasserCheck-Berlin.pdf";
				a.click();
				setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 4000); */
			} else {
				const err = new Error("Button not found");
				err.name = "ButtonNotFoundOnPDF";
			}
		};

		wrapper.addEventListener("click", handleClick);

		return () => {
			wrapper.removeEventListener("click", handleClick);
		};
	}, [pdfBlob]);

	return (
		<div className="flex w-full flex-col gap-12 px-5 py-8 lg:px-0">
			<section>
				<div className="flex flex-col gap-6">
					<h1 className="">{t("pageTitle")}</h1>
				</div>
			</section>
			{showTestingFeatures.includes("resetAllButtonOnHomepage") && (
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
			)}
			{showTestingFeatures.includes("newPDFButton") && (
				<div ref={wrapperRef}>
					<Button
						onClick={async () => {
							const pdfKeys = {
								"{date}": getToday(),
							};
							const pdfBlobCreated = await createPDF(
								pdfData as PDFProps,
								pdfKeys,
							);
							if (!pdfBlobCreated?.blob) {
								window.alert("PDF konnte nicht erstellt werden.");
								return;
							}
							setPdfBlob(pdfBlobCreated?.blob);
						}}
					>
						PDF
					</Button>
					{pdfBlob && (
						<DownloadItem
							buttonText="Runderladen"
							description="Beschreibung"
							downloadUrl="#results"
							fileType="XXX MB"
							date={getToday()}
							title="Title"
						/>
					)}
				</div>
			)}
			<section className="w-full" id="captureImageTest">
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
