"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button, ImageComponent } from "berlin-ui-library";
export default function About() {
	const t = useTranslations();

	return (
		<div className="flex flex-col gap-6 justify-self-center">
			<Link href="/">
				<Button variant="back-link" className="self-start">
					{t("common.backToStart")}
				</Button>
			</Link>
			<div className="flex flex-col gap-6">
				<h1 className="">{t("about.pageTitle")}</h1>
				<h2 className="">{t("about.subTitle")}</h2>
				<p className="">{t("about.content.paragraph1")}</p>
				<p className="">{t("about.content.paragraph2")}</p>
				<p className="">{t("about.content.paragraph3")}</p>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-6">
					<h3 className="">{t("about.credits.title2")}</h3>
					<ImageComponent src="/logo.svg" alt={t("about.credits.logo1.alt")} />
				</div>
				<div className="flex flex-col gap-6">
					<h3 className="">{t("about.credits.title2")}</h3>
					<div className="grid md:grid-cols-3"></div>
				</div>
			</div>
		</div>
	);
}
