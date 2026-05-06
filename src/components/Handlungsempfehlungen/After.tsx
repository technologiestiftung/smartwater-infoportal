import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "berlin-ui-library";
import { useMessages, useTranslations } from "next-intl";
import React, { ReactNode } from "react";

type TocMap = Record<string, string>;

const After: React.FC = () => {
	const t = useTranslations("recommendations.after");
	const content = useMessages() as {
		recommendations: {
			after: {
				list1: TocMap;
				list2: TocMap;
				list3: TocMap;
				list4: TocMap;
				list5: TocMap;
				list6: TocMap;
			};
		};
	};
	const list1 = content.recommendations.after.list1;
	const list2 = content.recommendations.after.list2;
	const list3 = content.recommendations.after.list3;
	const list4 = content.recommendations.after.list4;
	const list5 = content.recommendations.after.list5;
	const list6 = content.recommendations.after.list6;

	const getLink = (chunks: ReactNode) => {
		let text = "";
		if (typeof chunks === "string") {
			text = chunks;
		} else if (Array.isArray(chunks)) {
			text = chunks.join("");
		}
		if (text.includes("Merkblatt")) {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.dvgw.de/medien/dvgw/leistungen/publikationen/Info-wiederinbetriebnahme-trinkwasser-installation-nach-betriebsunterbrechungen.pdf",
			};
		}
		if (text.includes("Naturgefahrenportal")) {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.naturgefahrenportal.de/de",
			};
		}
		if (text.includes("Hochwasserschutzfibel")) {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.fib-bund.de/inhalt/themen/hochwasser/",
			};
		}
		if (text.includes("Vorsorgemaßnahmen")) {
			return {
				target: "_blank",
				variant: "extern",
				link: "https://www.fib-bund.de/inhalt/themen/hochwasser/",
			};
		}
		if (text.includes("Hochwasser")) {
			return {
				target: "_self",
				link: "/",
			};
		}
		return {
			target: "_self",
			link: "#",
		};
	};

	const Lists = [
		{
			listKey: "list1",
			list: list1,
		},
		{
			listKey: "list2",
			list: list2,
		},
		{
			listKey: "list3",
			list: list3,
		},
		{
			listKey: "list4",
			list: list4,
		},
		{
			listKey: "list5",
			list: list5,
		},
		{
			listKey: "list6",
			list: list6,
		},
	];

	return (
		<section className="mb-12 flex flex-col gap-12">
			<h2 className="font-normal">
				{t.rich("intro", {
					strong: (chunks) => <strong>{chunks}</strong>,
				})}
			</h2>
			{Lists.map(({ listKey, list }) => (
				<div className="flex flex-col gap-6" key={listKey}>
					<div className="flex items-center gap-4">
						<h3 className="font-normal">
							{t.rich(`${listKey}Intro`, {
								strong: (chunks) => <strong>{chunks}</strong>,
								underline: (chunks) => (
									<span className="underline">{chunks}</span>
								),
							})}
						</h3>
					</div>
					<ul className="list-none space-y-2 lg:ps-12">
						{Object.keys(list).map((key) => (
							<li key={key} className="flex items-start gap-2">
								<FontAwesomeIcon
									icon={faCheck}
									className={`shrink-0 text-[18px]`}
								/>
								<span className="whitespace-pre-line">
									{t.rich(`${listKey}.${key}`, {
										link: (chunks) => (
											<Link
												href={getLink(chunks).link}
												target={getLink(chunks).target}
												rel="noopener noreferrer"
												variant={getLink(chunks).variant || "default"}
											>
												{chunks}
											</Link>
										),
										strong: (chunks) => <strong>{chunks}</strong>,
									})}
								</span>
							</li>
						))}
					</ul>
				</div>
			))}
		</section>
	);
};

export default After;
