"use client";

import { getWarnings } from "@/server/actions/getWarnings";
import Link from "next/link";
import { Button, Image } from "berlin-ui-library";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Warning() {
	const t = useTranslations();
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
		? t("common.warning.noWarning")
		: t("common.warning.currentWarning");
	const background = warning ? "bg-message-error" : "bg-message-no-warning";

	return (
		<div
			className={`overflow-hidden ${background} flex w-full items-center justify-center gap-6 p-5`}
		>
			<Image
				className="w-16"
				src={warning ? "/warning.svg" : "/no-warning.svg"}
				alt="Warning Icon"
			/>
			<div>
				<p>{message}</p>
				<Link
					href="https://wasserportal.berlin.de/warnungen.php"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Button variant="linkWithIcon">
						{t("common.warning.furtherInformation")}
					</Button>
				</Link>
			</div>
		</div>
	);
}
