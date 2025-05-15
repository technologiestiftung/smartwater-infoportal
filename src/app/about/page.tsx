"use client";
import { useTranslations } from "next-intl";
import { Button, Image } from "berlin-ui-library";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function About() {
	const t = useTranslations();
	const router = useRouter();
	return (
		<div className="flex flex-col gap-6 justify-self-center px-5 py-8 lg:px-0">
			<Button
				className="w-full justify-end self-start lg:w-fit"
				onClick={() => {
					router.push("/");
				}}
				variant="back-link"
			>
				{t("common.backToStart")}
			</Button>
			<div className="flex flex-col gap-6">
				<h1 className="">{t("about.pageTitle")}</h1>
				<h2 className="">{t("about.subTitle")}</h2>
				<p>
					{t.rich("about.content.paragraph1", {
						header: (chunks) => <span className="font-bold">{chunks}</span>,
					})}
				</p>
				<div className="">
					{t.rich("about.content.paragraph2", {
						strong: (chunks) => <strong>{chunks}</strong>,
						ol: (chunks) => (
							<ol className="ml-2 mt-1 list-inside list-decimal">{chunks}</ol>
						),
						li: (chunks) => <li className="">{chunks}</li>,
					})}
				</div>
				<div className="">
					{t.rich("about.content.paragraph3", {
						strong: (chunks) => <strong>{chunks}</strong>,
						ul: (chunks) => (
							<ul className="ml-2 mt-1 list-inside list-disc">{chunks}</ul>
						),
						li: (chunks) => <li className="">{chunks}</li>,
						br: () => <br />,
					})}
				</div>
				<p className="">
					{t.rich("about.content.paragraph4", {
						link: (chunks) => (
							<Link
								className="text-text-link"
								href="https://gemeinsamdigital.berlin.de/de/smart-water/"
							>
								{chunks}
							</Link>
						),
					})}
				</p>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-6">
					<h3 className="">{t("about.credits.title1")}</h3>
					<div className="grid grid-cols-2 items-center justify-items-center lg:grid-cols-4">
						<div className="relative flex h-36 w-40 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/Logo_HAD_SenMVKU.png"
								href={t("about.credits.logo1.link")}
								alt={t("about.credits.logo1.alt")}
							/>
						</div>
						<div className="relative flex h-40 w-56 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/Senatsverwaltung-Stadtentwicklung-Bauen-Wohnen.png"
								href={t("about.credits.logo2.link")}
								alt={t("about.credits.logo2.alt")}
							/>
						</div>
						<div className="relative flex h-40 w-56 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/BWB-Logo.png"
								href={t("about.credits.logo3.link")}
								alt={t("about.credits.logo3.alt")}
							/>
						</div>
						<div className="relative flex h-40 w-56 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/KWB-Logo.png"
								href={t("about.credits.logo4.link")}
								alt={t("about.credits.logo4.alt")}
							/>
						</div>
						<div className="relative flex h-40 w-56 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/TSB-logo.svg"
								href={t("about.credits.logo5.link")}
								alt={t("about.credits.logo5.alt")}
							/>
						</div>
						<div className="relative flex h-36 w-48 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/Berliner-Regenwasseragentur.png"
								href={t("about.credits.logo6.link")}
								alt={t("about.credits.logo6.alt")}
							/>
						</div>
						<div className="relative flex h-40 w-56 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/bezirksamt-pankow.png"
								href={t("about.credits.logo7.link")}
								alt={t("about.credits.logo7.alt")}
							/>
						</div>
						<div className="relative flex h-40 w-56 justify-center overflow-hidden">
							<Image
								className="h-full w-full min-w-full content-center object-cover"
								src="/Bezirksamt-Friedrichshain-Kreuzberg.png"
								href={t("about.credits.logo8.link")}
								alt={t("about.credits.logo8.alt")}
							/>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-6">
					<h3 className="">{t("about.credits.title2")}</h3>
					<div className="grid lg:grid-cols-3"></div>
				</div>
			</div>
		</div>
	);
}
