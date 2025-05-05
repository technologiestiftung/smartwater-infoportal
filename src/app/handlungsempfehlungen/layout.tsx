import React from "react";

export default async function RecommendationsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="w-full">{children}</div>;
}
