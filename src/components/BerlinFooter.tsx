import { formatGermanTimestamp } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function BerlinFooter() {
	const [html, setHtml] = useState("");
	const [timestamp, setTimestamp] = useState<number | null>(null);

	useEffect(() => {
		fetch("/api/berlin-footer")
			.then((res) => res.json())
			.then((data) => {
				setHtml(data.html);
				setTimestamp(data.timestamp);
			});
	}, []);

	return (
		<div className="mx-auto flex w-full flex-grow flex-col py-5">
			{" "}
			{/* md:max-w-[61.25rem] */}
			<div dangerouslySetInnerHTML={{ __html: html }} />
			{timestamp && (
				<p className="mt-4 text-sm text-gray-600">
					Footer zuletzt aktualisiert: {formatGermanTimestamp(timestamp)}
				</p>
			)}
		</div>
	);
}
