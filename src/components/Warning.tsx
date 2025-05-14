import React, { useEffect, useState } from "react";

interface WarningData {
	message: string;
	linkText?: string;
	linkUrl?: string;
	color: string;
}
interface WarningProps {
	type: "banner" | "widget";
}

const Warning: React.FC<WarningProps> = ({ type }) => {
	const [warning, setWarning] = useState<WarningData | null>(null);
	const colors = {
		red: "bg-[#FDECEE]",
		green: "bg-[#ECF8F5]",
	};
	const noWarning = {
		message: "Derzeit liegen keine Warnungen im Raum Berlin vor.",
		linkText: "Weitere Informationen finden Sie im Wasserportal Berlin",
		linkUrl: "https://wasserportal.berlin.de",
		color: colors.green,
	};
	const currentWarnings = {
		message: "Es liegen mindestens 1 Warnung im Raum Berlin vor.",
		linkText: "Weitere Informationen finden Sie im Wasserportal Berlin",
		linkUrl: "https://wasserportal.berlin.de",
		color: colors.red,
	};

	useEffect(() => {
		const fetchWarning = async () => {
			try {
				// const responseAllGermanState = await fetch("/api/all-german-states");
				// const dataAllGermanState = await responseAllGermanState.json();
				// console.log("Warning data from /api/all-german-states:", dataAllGermanState);

				const response = await fetch("/api/warning");
				const data = await response.json();
				// console.log("Warning data from /api/warning:", data);

				if (data.dwdWarnings?.length > 0 || data.lhpWarnings?.length > 0) {
					setWarning(currentWarnings);
				} else {
					setWarning(noWarning);
				}
			} catch (error) {
				throw new Error(`Failed to fetch warning data: ${error}`);
			}
		};

		fetchWarning();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!warning) {
		return null;
	}

	const RenderMSG = () => {
		if (warning.linkText && warning.linkUrl) {
			return (
				<>
					+++ {warning.message}
					{warning.linkText && warning.linkUrl && (
						<>
							{" "}
							–{" "}
							<a
								href={warning.linkUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 underline hover:text-blue-800"
							>
								{warning.linkText}
							</a>{" "}
						</>
					)}
					+++
				</>
			);
		}
		return <>+++ {warning.message} +++</>;
	};

	if (type === "banner") {
		return (
			<div className={`overflow-hidden whitespace-nowrap ${warning.color}`}>
				<div className="animate-scroll-left hover-pause inline-block select-none py-2">
					<RenderMSG />
				</div>
			</div>
		);
	}
	// widget
	return (
		<div
			className={`overflow-hidden ${warning.color} flex h-full w-full items-center justify-center p-4`}
		>
			<h2>
				<RenderMSG />
			</h2>
		</div>
	);
};

export default Warning;
