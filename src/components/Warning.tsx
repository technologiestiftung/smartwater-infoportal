"use client";

import { cn } from "@/lib/utils";
import { LINK_MAP } from "@/lib/utils/linkMap";
import { richText } from "@/lib/utils/richText";
import { getWarnings } from "@/server/actions/getWarnings";
import { Button, Image } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

	const getBackground = () => {
		if (warning?.warning) {
			return "bg-message-error";
		} else if (warning?.error) {
			return "bg-message-warning-error";
		}
		return "bg-message-no-warning";
	};

	const iconSrc = (() => {
		if (warning?.warning) {
			return "/warning.svg";
		}
		if (warning?.error) {
			return "/error.svg";
		}
		return "/no-warning.svg";
	})();

	return (
		<div
			className={cn(
				"flex w-full items-center justify-center gap-6 overflow-hidden p-5",
				getBackground(),
			)}
		>
			<Image className="w-16" src={iconSrc} alt="Warning Icon" />
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
				{!warning?.error && (
					<div className="[&_a]:inline-block">
						{t.rich("common.warning.furtherInformation", {
							...richText(LINK_MAP),
							wasserportal: (chunks) => (
								<Button variant="linkWithIcon">{chunks}</Button>
							),
						})}
					</div>
				)}
				{warning?.timeStamp && (
					<p
						className={cn(
							"copyright text-grey-darkest",
							warning?.error && "mt-2",
						)}
					>
						{t("common.warning.timeStamp", {
							timeStamp: warning?.timeStamp,
						})}
					</p>
				)}
			</div>
		</div>
	);
}
