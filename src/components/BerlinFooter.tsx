import { useEffect, useState } from "react";

export default function BerlinFooter() {
	const [html, setHtml] = useState("");

	useEffect(() => {
		fetch("/api/berlin-footer")
			.then((res) => res.json())
			.then((data) => {
				setHtml(data.html);
			});
	}, []);

	return (
		<footer
			className="mx-auto flex w-full flex-grow flex-col py-5 md:max-w-[61.25rem]"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
