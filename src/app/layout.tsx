import "./globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import React from "react";
import type { Viewport } from "next";
import LayoutClient from "./LayoutClient";
import "../lib/fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";

export const metadata: Metadata = {
	title: "Berlin Smartwater Info-Planner",
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
			<body className={`antialiased`}>
				<NextIntlClientProvider>
					<LayoutClient>{children}</LayoutClient>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
