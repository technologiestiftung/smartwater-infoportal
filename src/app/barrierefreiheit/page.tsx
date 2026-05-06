"use client";
import { useMessages, useTranslations } from "next-intl";
import { Link } from "berlin-ui-library";

type TocMap = Record<string, string>;

export default function Barrierefreiheit() {
	const t = useTranslations("barrierefreiheit");

	const content = useMessages() as {
		barrierefreiheit: {
			list1: TocMap;
			list2: TocMap;
		};
	};

	const list1 = content.barrierefreiheit.list1;
	const list2 = content.barrierefreiheit.list2;

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 pt-8 pb-16 lg:px-0">
			<section className="flex flex-col gap-10">
				<h1 className="">{t("pageTitle")}</h1>
				<div>
					<h2 className="mb-2">{t("sub_title1")}</h2>
					<p className="">{t("description1")}</p>
					<br />
					<p className="">{t("description2")}</p>
					<br />
					<p className="">
						{t.rich("description3", {
							link: (chunks) => (
								<Link
									href={chunks}
									rel="noopener noreferrer"
									className="text-text-link underline"
								>
									{chunks}
								</Link>
							),
						})}
					</p>
				</div>
				<div>
					<h2 className="mb-2">{t("sub_title2")}</h2>
					<p className="">{t("description2_1")}</p>
					<br />
					<p className="">{t("description2_2")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("sub_title3")}</h2>
					<p className="">{t("description3_1")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("sub_title4")}</h2>
					<p className="">{t("description4_1")}</p>
					<p className="">{t("description4_2")}</p>
					<p className="">{t("description4_3")}</p>
					<br />
					<p className="font-bold">{t("list_title1")}</p>
					<ul className="list-disc lg:ps-6">
						{Object.keys(list1).map((key) => (
							<li key={key}>
								{t.rich(`list1.${key}`, {
									strong: (chunks) => <strong>{chunks}</strong>,
								})}
							</li>
						))}
					</ul>
				</div>
				<div>
					<h2 className="mb-2">{t("sub_title5")}</h2>
					<p className="">{t("description5_1")}</p>
					<br />
					<p className="font-bold">{t("list_title2")}</p>
					<ul className="list-disc lg:ps-6">
						{Object.keys(list2).map((key) => (
							<li key={key}>
								{t.rich(`list2.${key}`, {
									strong: (chunks) => <strong>{chunks}</strong>,
								})}
							</li>
						))}
					</ul>
				</div>
				<div>
					<h2 className="mb-2">{t("sub_title6")}</h2>
					<p className="">{t("description6_1")}</p>
					<br />
					<p className="font-bold">{t("description6_2")}</p>
					<p className="">{t("description6_3")}</p>
					<p className="">
						{t.rich("description6_4", {
							link: (chunks) => (
								<Link
									href={`mailto:${chunks}`}
									rel="noopener noreferrer"
									className="text-text-link underline"
								>
									{chunks}
								</Link>
							),
						})}
					</p>
					<p className="">{t("description6_5")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("sub_title7")}</h2>
					<p className="">{t("description7_1")}</p>
					<br />
					<p className="">
						{t.rich("description7_2", {
							link: (chunks) => (
								<Link
									href="https://www.berlin.de/lb/digitale-barrierefreiheit/includes/formular.1326107.php"
									rel="noopener noreferrer"
									className="text-text-link underline"
								>
									{chunks}
								</Link>
							),
						})}
					</p>
					<p className="">
						{t.rich("description7_3", {
							link: (chunks) => (
								<Link
									href="https://www.berlin.de/lb/digitale-barrierefreiheit/aufgaben/durchsetzungsverfahren/"
									rel="noopener noreferrer"
									className="text-text-link underline"
								>
									{chunks}
								</Link>
							),
						})}
					</p>
				</div>
			</section>
		</div>
	);
}
