import React from "react";

export default async function floodCheckLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="w-full">{children}</div>;
}
