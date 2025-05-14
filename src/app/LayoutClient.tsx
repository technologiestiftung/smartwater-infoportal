"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import BerlinFooter from "@/components/BerlinFooter";

const Header = dynamic(
	() => import("berlin-ui-library").then((mod) => mod.Header),
	{ ssr: false },
);

export default function LayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const t = useTranslations();
	const paths = usePathname();
	const pathNames = paths
		.split("/")
		.filter((segment) => segment)
		.map((segment, index, arr) => ({
			href: "/" + arr.slice(0, index + 1).join("/"), // Construct the breadcrumb path
			label: t(`common.breadcrumb.${segment}`, { defaultValue: segment }), // Use translation key with fallback
		}))
		.filter(Boolean); // Filter out any empty segments
	const rootBreadcrumb = [
		{
			href: "https://www.berlin.de/sen/uvk/",
			label: t("common.breadcrumb.root"),
		},
		{
			href: "https://www.berlin.de/sen/uvk/umwelt/",
			label: t("common.breadcrumb.environment"),
		},
		{
			href: "https://www.berlin.de/sen/uvk/umwelt/wasser-und-geologie/",
			label: t("common.breadcrumb.waterGeology"),
		},
		{
			href: "https://www.berlin.de/sen/uvk/umwelt/wasser-und-geologie/starkregen-und-ueberflutungen/",
			label: t("common.breadcrumb.rainFlood"),
		},
		{
			href: "/",
			label: t("common.breadcrumb.infoportal"),
		},
	];
	const breadcrumbs = [...rootBreadcrumb, ...pathNames];
	return (
		<div className="flex min-h-screen flex-col">
			<Header
				breadcrumbs={breadcrumbs}
				caption="Mobilität, Verkehr, Klimaschutz und Umwelt"
				showLanguageSelect={true}
				header={"Senatsverwaltung für"}
				menuItems={[
					{
						href: "/",
						label: t("common.menu.home"),
					},
					{
						href: "/about",
						label: t("common.menu.about"),
					},
					{
						href: "/allgemeine-informationen",
						label: t("common.menu.generalInfo"),
					},
					{
						href: "/wasser-check",
						label: t("common.menu.floodCheck"),
					},
					{
						href: "/handlungsempfehlungen",
						label: t("common.menu.recommendations"),
					},
				]}
				onOpenMenu={() => {}}
				onSearch={() => {}}
			/>
			<div className="flex flex-grow justify-center">
				<main className="mx-auto flex flex-grow flex-col py-5 md:max-w-[61.25rem]">
					{children}
				</main>
			</div>
			<BerlinFooter />
		</div>
	);
}
