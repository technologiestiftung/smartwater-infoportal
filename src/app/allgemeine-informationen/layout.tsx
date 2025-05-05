import React from "react";

export default async function GeneralInformationLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div>{children}</div>;
}
