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

const Footer = dynamic(
	() => import("berlin-ui-library").then((mod) => mod.Footer),
	{ ssr: false },
);

const filterOutSegments = [
	".well-known",
	"appspecific",
	"com.chrome.devtools.json",
	"scenario-map",
	"widget-screenshot",
	"riskblock-screenshot",
	"screenshot",
	"pdf-viewer",
	"api",
];

export default function LayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const t = useTranslations();
	const paths = usePathname();
	const pathNames = paths
		.split("/")
		.filter((segment) => !!segment && !filterOutSegments.includes(segment))
		.map((segment, index, arr) => ({
			href: "/" + arr.slice(0, index + 1).join("/"), // Construct the breadcrumb path
			label: t(`common.breadcrumb.${segment}`, { defaultValue: segment }), // Use translation key with fallback
		}))
		.filter(Boolean); // Filter out any empty segments
	const rootBreadcrumb = [
		{
			href: "/",
			label: t("common.breadcrumb.infoportal"),
		},
	];
	const breadcrumbs = [...rootBreadcrumb, ...pathNames];
	const showBreadcrumbs = paths !== "/";
	const isRenderingScreenshot =
		paths.startsWith("/scenario-map") ||
		paths.startsWith("/widget-screenshot") ||
		paths.startsWith("/riskblock-screenshot") ||
		paths.startsWith("/pdf-viewer");
	if (isRenderingScreenshot) {
		return <>{children}</>;
	}
	return (
		<div className="flex min-h-screen flex-col">
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:border-2 focus:border-black focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-text-link focus:outline-2 focus:outline-offset-2 focus:outline-black"
				href="#main-content"
			>
				Zum Inhalt springen
			</a>
			<Header
				breadcrumbs={breadcrumbs}
				showBreadcrumbs={showBreadcrumbs}
				caption={t("home.headerSubTitle")}
				showLanguageSelect={false}
				header={t("home.headerTitle")}
				language="de"
				doBerlinSearch
				translations={{
					de: {
						accessibility: t("common.accessibility"),
						search: t("common.search"),
						menu: t("common.menu.button"),
						"menu.title": t("common.menu.title"),
						"accessibilityMenu.title": t("common.accessibilityMenu.title"),
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
						"search.title": t("common.menu.search.title"),
						"search.placeholder": t("common.menu.search.placeholder"),
						"search.berlinSearchInfo": t("common.menu.search.berlinSearchInfo"),
					},
				}}
				menuItems={[
					{
						href: "/about",
						label: t("common.menu.about"),
					},
					{
						href: "/hintergrund-informationen",
						label: t("common.menu.generalInfo"),
					},
					{
						href: "/hochwasser-check",
						label: t("common.menu.floodCheck"),
					},
					{
						href: "/handlungsempfehlungen",
						label: t("common.menu.recommendations"),
					},
				]}
				onOpenMenu={() => {}}
				accessibilityItems={[
					{
						question: (
							<span className="flex flex-col gap-6 font-normal">
								<a
									className="inline-flex items-center gap-2 text-text-link hover:underline"
									href="https://www.berlin.de/sen/uvk/ueber-uns/leichte-sprache/"
								>
									<img
										alt=""
										aria-hidden="true"
										className="h-6 w-6 min-w-6 object-contain"
										src="/icon-leichte-sprache.svg"
									/>
									{t("common.accessibilityMenu.easyLanguage.title")}
								</a>
								<a
									className="inline-flex items-center gap-2 text-text-link hover:underline"
									href="https://www.berlin.de/sen/uvk/ueber-uns/gebaerdensprache/"
								>
									<img
										alt=""
										aria-hidden="true"
										className="h-6 w-6 min-w-6 object-contain"
										src="/icon-dgs.svg"
									/>
									{t("common.accessibilityMenu.signLanguage.title")}
								</a>
							</span>
						),
						label: null,
					},
					{
						question: t("common.accessibilityMenu.barrierefreiheit.question"),
						label: t("common.accessibilityMenu.barrierefreiheit.title"),
						href: "/barrierefreiheit",
					},
					{
						question: t("common.accessibilityMenu.additionalInfo.question"),
						label: t("common.accessibilityMenu.additionalInfo.title"),
						href: "https://www.berlin.de/lb/digitale-barrierefreiheit/",
						external: true,
					},
				]}
			/>
			<div className="flex flex-grow justify-center overflow-x-hidden">
				<main
					id="main-content"
					tabIndex={-1}
					className="mx-auto flex flex-grow flex-col focus:outline-none lg:max-w-[61.25rem]"
				>
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
								href: "/impressum",
								label: t("common.footer.imprint"),
							},
							{
								href: "/datenschutz",
								label: t("common.footer.privacy"),
							},
							{
								href: "/barrierefreiheit",
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
			<BerlinFooter />
		</div>
	);
}
