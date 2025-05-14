"use client";
import { useTranslations } from "next-intl";
import { Button, Image } from "berlin-ui-library";
import { useRouter } from "next/navigation";
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
				<p className="">{t("about.content.paragraph1")}</p>
				<p className="">{t("about.content.paragraph2")}</p>
				<p className="">{t("about.content.paragraph3")}</p>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-6">
					<h3 className="">{t("about.credits.title2")}</h3>
					<Image src="/logo.svg" alt={t("about.credits.logo1.alt")} />
				</div>
				<div className="flex flex-col gap-6">
					<h3 className="">{t("about.credits.title2")}</h3>
					<div className="grid lg:grid-cols-3"></div>
				</div>
			</div>
		</div>
	);
}
