"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// Dynamically import client components
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
	return (
		<div className="flex min-h-screen flex-col">
			<Header showLanguageSelect={false} />
			<div className="flex flex-grow justify-center">
				<main className="container flex flex-grow flex-col p-5">
					{children}
				</main>
			</div>
			<Footer
				footerColumns={[
					{
						title: "Senatsverwaltung",
						links: [
							{
								href: "/about/",
								label: t("common.footer.about"),
							},
							{
								href: "/imprint/",
								label: t("common.footer.imprint"),
							},
							{
								href: "/privacy-note/",
								label: t("common.footer.privacy"),
							},
							{
								href: "/accessibility-statement/",
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
