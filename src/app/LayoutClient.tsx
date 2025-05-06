"use client";
import React from "react";
import dynamic from "next/dynamic";

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
	return (
		<div className="flex min-h-screen flex-col">
			<Header showLanguageSelect={false} />
			<div className="flex flex-grow justify-center">
				<main className="container flex flex-grow flex-col items-start p-5">
					{children}
				</main>
			</div>
			<Footer
				footerColumns={[
					{
						links: [
							{
								href: "/about-project/",
								label: "About the Project",
							},
							{
								href: "/imprint/",
								label: "Imprint",
							},
							{
								href: "/privacy-note/",
								label: "Privacy Policy",
							},
							{
								href: "/accessibility-statement/",
								label: "Accessibility Statement",
							},
						],
						title: "About",
					},
					{
						links: [
							{
								href: "/all-offers/",
								label: "All Offers",
							},
							{
								href: "/all-offers/?category=kultur",
								label: "Culture",
							},
							{
								href: "/all-offers/?category=sport",
								label: "Sports",
							},
							{
								href: "/all-offers/?category=bildung_beratung",
								label: "Education",
							},
							{
								href: "/all-offers/?category=freizeit",
								label: "Leisure",
							},
							{
								href: "/map/",
								label: "Map",
							},
						],
						title: "Content Categories",
					},
					{
						isDefaultOpen: true,
						links: [
							{
								href: "https://www.facebook.com/BerlinDE/",
								label: "Facebook",
							},
							{
								href: "https://www.instagram.com/berlinde/",
								label: "Instagram",
							},
						],
						title: "Social Media",
					},
				]}
				language="de"
				showScrollToTop
				translations={{
					de: {
						About: "Über uns",
						"About the Project": "Über das Projekt",
						"Accessibility Statement": "Barrierefreiheit",
						"All Offers": "Alle Angebote",
						"Content Categories": "Inhaltskategorien",
						Culture: "Kultur",
						Education: "Bildung & Beratung",
						Facebook: "Facebook",
						Imprint: "Impressum",
						Instagram: "Instagram",
						Leisure: "Freizeit",
						Map: "Karte",
						"Privacy Policy": "Datenschutz",
						"Social Media": "Soziale Medien",
						Sports: "Sport",
						toTheTop: "Zum Seitenanfang",
					},
					en: {
						toTheTop: "Back to top",
					},
				}}
			/>
		</div>
	);
}
