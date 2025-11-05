"use client";

import { getWarnings } from "@/server/actions/getWarnings";
import Link from "next/link";
import { Button, Image } from "berlin-ui-library";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type WarningProps = {
	warning: boolean;
	timeStamp: string;
	error?: boolean;
};

export default function Warning() {
	const t = useTranslations();
	const [warning, setWarning] = useState<WarningProps | null>(null);

	useEffect(() => {
		const requestWarning = async () => {
			const { dwdWarnings, lhpWarnings, timeStamp, error } =
				await getWarnings();
			setWarning({
				warning:
					(dwdWarnings?.length || 0) > 0 || (lhpWarnings?.length || 0) > 0,
				timeStamp,
				error: !!error,
			});
		};
		requestWarning();
	}, []);

	const background = warning?.warning
		? "bg-message-error"
		: "bg-message-no-warning";

	return (
		<div
			className={`overflow-hidden ${background} flex w-full items-center justify-center gap-6 p-5`}
		>
			<Image
				className="w-16"
				src={
					warning?.warning || warning?.error
						? "/warning.svg"
						: "/no-warning.svg"
				}
				alt="Warning Icon"
			/>
			<div>
				<p>
					{(() => {
						if (warning?.error) {
							return t("common.warning.error");
						} else if (warning?.warning) {
							return t("common.warning.currentWarning");
						}
						return t("common.warning.noWarning");
					})()}
				</p>
				<Link
					href="https://wasserportal.berlin.de/warnungen.php"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Button variant="linkWithIcon">
						{t("common.warning.furtherInformation")}
					</Button>
				</Link>
				{warning?.timeStamp && (
					<p className="copyright text-grey-darkest">
						{t("common.warning.timeStamp", {
							timeStamp: warning?.timeStamp,
						})}
					</p>
				)}
			</div>
		</div>
	);
}
