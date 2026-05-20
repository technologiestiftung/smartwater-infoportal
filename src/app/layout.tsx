import MatomoAnalytics from "@/components/MatomoAnalytics";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import React, { Suspense } from "react";
import "../lib/fontawesome";
import "./globals.css";
import LayoutClient from "./LayoutClient";
import Script from "next/script";

export const metadata: Metadata = {
	title: "HochwasserCheck Berlin",
	description: "created by Ts.Berlin",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();

	return (
		<html lang={locale}>
			<head>
				<Script
					src="https://www.berlin.de/i9f/v4/js/bo-info.js"
					strategy="beforeInteractive"
				/>
			</head>
			<body className={`antialiased`}>
				<Suspense fallback={null}>
					<MatomoAnalytics />
				</Suspense>
				<NextIntlClientProvider>
					<LayoutClient>{children}</LayoutClient>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
