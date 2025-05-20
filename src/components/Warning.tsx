// ❌ Remove any 'use client' directive at the top of the file
"use client";

import { getWarnings } from "@/server/actions/getWarnings";
import Link from "next/link";
import { Button, Image } from "berlin-ui-library";
import { useEffect, useState } from "react";

interface WarningProps {
	type: "banner" | "widget";
}

export default function Warning({ type }: WarningProps) {
	const [warning, setWarning] = useState(false);

	useEffect(() => {
		const requestWarning = async () => {
			const { dwdWarnings, lhpWarnings } = await getWarnings();
			setWarning(
				(dwdWarnings?.length || 0) > 0 || (lhpWarnings?.length || 0) > 0,
			);
		};
		requestWarning();
	}, []);

	const message = warning
		? "Achtung! Es liegt mindestens eine Warnung für den Raum Berlin vor."
		: "Derzeit liegen keine Warnungen im Raum Berlin vor.";
	const background = warning ? "bg-[#FDECEE]" : "bg-[#ECF8F5]";

	const RenderButton = () => (
		<Link
			href="https://wasserportal.berlin.de/warnungen.php"
			target="_blank"
			rel="noopener noreferrer"
		>
			<Button variant="linkWithIcon">
				Weitere Informationen finden Sie im Wasserportal Berlin
			</Button>
		</Link>
	);

	if (type === "banner") {
		return (
			<div className={`overflow-hidden whitespace-nowrap ${background}`}>
				<div className="animate-scroll-left inline-block select-none py-2 hover:[animation-play-state:paused]">
					+++ {message} {"\u002d"} <RenderButton /> +++
				</div>
			</div>
		);
	}

	return (
		<div
			className={`overflow-hidden ${background} flex h-full w-full items-center justify-center gap-4 p-4`}
		>
			<Image
				className="w-16"
				src={warning ? "/red-warning.svg" : "/green-icon-3.svg"}
				alt="Warning Icon"
			/>
			<div>
				<h3>{message}</h3>
				<RenderButton />
			</div>
		</div>
	);
}
