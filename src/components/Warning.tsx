import { Button, Image } from "berlin-ui-library";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface WarningProps {
	type: "banner" | "widget";
}

const Warning: React.FC<WarningProps> = ({ type }) => {
	const [warning, setWarning] = useState<boolean>(false);
	const message = warning
		? "Achtung! Es liegt mindestens eine Warnung für den Raum Berlin vor."
		: "Derzeit liegen keine Warnungen im Raum Berlin vor.";
	const background = warning ? "bg-[#FDECEE]" : "bg-[#ECF8F5]";

	useEffect(() => {
		const fetchWarning = async () => {
			try {
				const response = await fetch("/api/warning");
				const data = await response.json();
				setWarning(
					data.dwdWarnings?.length > 0 || data.lhpWarnings?.length > 0,
				);
			} catch (error) {
				throw new Error(`Failed to fetch warning data: ${error}`);
			}
		};
		fetchWarning();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const RenderButton = () => {
		return (
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
	};

	if (type === "banner") {
		return (
			<div className={`overflow-hidden whitespace-nowrap ${background}`}>
				<div className="animate-scroll-left inline-block select-none py-2 hover:[animation-play-state:paused]">
					+++ {message} {"\u002d"} <RenderButton /> +++
				</div>
			</div>
		);
	}
	// widget
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
};

export default Warning;
