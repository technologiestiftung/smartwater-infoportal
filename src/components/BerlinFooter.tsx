import { getBerlinFooter } from "@/server/actions/getBerlinFooter";
import { useEffect, useState } from "react";

export default function BerlinFooter() {
	const [html, setHtml] = useState<string | undefined>("");

	useEffect(() => {
		const requestBerlinFooter = async () => {
			const getHTML = await getBerlinFooter();
			setHtml(getHTML.data);
		};
		requestBerlinFooter();
	}, []);

	if (!html) {
		return null;
	}

	return (
		<div className="mx-auto w-full">
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	);
}
