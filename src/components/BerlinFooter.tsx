import { useEffect, useState } from "react";

export default function BerlinFooter() {
	const [html, setHtml] = useState("");

	useEffect(() => {
		setHtml("<h1>Test Berlin Footer...</h1>");
	}, []);

	return (
		<div className="mx-auto flex w-full flex-grow flex-col py-5">
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	);
}
