"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const Header = dynamic(
	() => import("berlin-ui-library").then((mod) => mod.Header),
	{ ssr: false },
);
const Footer = dynamic(
	() => import("berlin-ui-library").then((mod) => mod.Footer),
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
				showLanguageSelect={false}
				header={"Senatsverwaltung für"}
				language="de"
				translations={{
					de: {
						accessibility: t("common.accessibility"),
						search: t("common.search"),
						menu: t("common.menu.button"),
						"menu.title": t("common.menu.title"),
						"accessibilityMenu.title": t(
							"common.accessibilityMenu.barrierefreiheit.title",
						),
						"accessibilityMenu.barrierefreiheit.question": t(
							"common.accessibilityMenu.barrierefreiheit.question",
						),
						"accessibilityMenu.barrierefreiheit": t(
							"common.accessibilityMenu.barrierefreiheit.title",
						),
						"accessibilityMenu.contact.question": t(
							"common.accessibilityMenu.contact.question",
						),
						"accessibilityMenu.contact": t(
							"common.accessibilityMenu.contact.title",
						),
						"accessibilityMenu.additionalInfo.question": t(
							"common.accessibilityMenu.additionalInfo.question",
						),
						"accessibilityMenu.additionalInfo": t(
							"common.accessibilityMenu.additionalInfo.title",
						),
					},
				}}
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
				<main className="mx-auto flex flex-grow flex-col py-5 lg:max-w-[61.25rem]">
					{children}
				</main>
			</div>
			<Footer
				footerColumns={[
					{
						title: t("common.footer.title"),
						links: [
							{
								href: "/about/",
								label: t("common.footer.about"),
							},
							{
								href: "https://www.berlin.de/sen/uvk/ueber-uns/impressum/",
								label: t("common.footer.imprint"),
							},
							{
								href: "https://www.berlin.de/sen/uvk/datenschutzerklaerung.844084.php",
								label: t("common.footer.privacy"),
							},
							{
								href: "https://www.berlin.de/sen/uvk/barrierefreiheitserklaerung.904478.php",
								label: t("common.footer.accessibility"),
							},
						],
					},
				]}
				language="de"
				showScrollToTop
				translations={{
					de: {
						toTheTop: t("common.toPageTop"),
					},
				}}
			/>
		</div>
	);
}
