import React from "react";

export default async function QuestionnaireLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="w-full">{children}</div>;
}
