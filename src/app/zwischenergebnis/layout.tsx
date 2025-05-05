import React from "react";

export default async function CheckResultsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="w-full">{children}</div>;
}
