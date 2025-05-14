"use client";
import { useTranslations } from "next-intl";
import { Button, Image } from "berlin-ui-library";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function About() {
	const t = useTranslations();
	const router = useRouter();

	return (
		<div className="flex flex-col gap-6 justify-self-center">
			<Button
				onClick={() => router.push("/")}
				variant="back-link"
				className="self-start"
			>
				{t("common.backToStart")}
			</Button>
			<div className="flex flex-col gap-6">
				<h1 className="">{t("about.pageTitle")}</h1>
				<h2 className="">{t("about.subTitle")}</h2>
				<p>
					{t.rich("about.content.paragraph1", {
						header: (chunks) => <p className="font-bold">{chunks}</p>,
					})}
				</p>
				<p className="">
					{t.rich("about.content.paragraph2", {
						strong: (chunks) => <strong>{chunks}</strong>,
						ol: (chunks) => (
							<ol className="ml-2 mt-1 list-inside list-decimal">{chunks}</ol>
						),
						li: (chunks) => <li className="">{chunks}</li>,
					})}
				</p>
				<p className="">
					{t.rich("about.content.paragraph3", {
						strong: (chunks) => <strong>{chunks}</strong>,
						ul: (chunks) => (
							<ul className="ml-2 mt-1 list-inside list-disc">{chunks}</ul>
						),
						li: (chunks) => <li className="">{chunks}</li>,
						br: () => <br />,
					})}
				</p>
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
					<div className="grid grid-cols-6">
						<Image
							src="/Logo_HAD_SenMVKU.png"
							alt={t("about.credits.logo1.alt")}
						/>
						<div className="">
							<Image
								className=""
								src="/Senatsverwaltung-Stadtentwicklung-Bauen-Wohnen.png"
								alt={t("about.credits.logo2.alt")}
							/>
						</div>
						<Image src="/BWB-Logo.png" alt={t("about.credits.logo3.alt")} />{" "}
						<Image src="/KWB-Logo.png" alt={t("about.credits.logo4.alt")} />{" "}
						<Image src="/TSB-logo.png" alt={t("about.credits.logo5.alt")} />{" "}
						<Image
							src="/Berliner-Regenwasseragentur.png"
							alt={t("about.credits.logo6.alt")}
						/>
						<Image
							src="/Berliner-Regenwasseragentur.png"
							alt={t("about.credits.logo7.alt")}
						/>
						<Image
							src="/Bezirksamt-Friedrichshain-Kreuzberg.png"
							alt={t("about.credits.logo8.alt")}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-6">
					<h3 className="">{t("about.credits.title2")}</h3>
					<Image src="/logo.svg" alt={t("about.credits.logo1.alt")} />
				</div>
			</div>
		</div>
	);
}
