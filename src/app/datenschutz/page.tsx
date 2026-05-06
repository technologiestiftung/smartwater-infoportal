"use client";
import { useTranslations } from "next-intl";
import { Link } from "berlin-ui-library";

export default function Datenschutz() {
	const t = useTranslations("datenschutz");

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 pt-8 pb-16 lg:px-0">
			<section className="flex flex-col gap-10">
				<h1 className="">{t("pageTitle")}</h1>
				<div>
					<h2 className="mb-2">{t("responsible.title")}</h2>
					<p className="">{t("responsible.description")}</p>
					<h3 className="mt-4">{t("responsible.name")}</h3>
					<p className="">{t("responsible.address_title")}</p>
					<p className="">{t("responsible.address")}</p>
					<p className="">{t("responsible.plz")}</p>
				</div>
			</section>
		</div>
	);
}
