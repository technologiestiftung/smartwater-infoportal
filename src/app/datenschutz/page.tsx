"use client";
import { useMessages, useTranslations } from "next-intl";
import { Link } from "berlin-ui-library";

type TocMap = Record<string, string>;

export default function Datenschutz() {
	const t = useTranslations("datenschutz");

	const content = useMessages() as {
		datenschutz: {
			central_services: {
				list1: TocMap;
			};
		};
	};

	const list1 = content.datenschutz.central_services.list1;

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 pt-8 pb-16 lg:px-0">
			<section className="flex flex-col gap-10">
				<h1 className="">{t("pageTitle")}</h1>
				<div>
					<h2 className="mb-2">{t("responsible.title")}</h2>
					<p className="">{t("responsible.description")}</p>
					<h3 className="mt-4">{t("responsible.name")}</h3>
					<p className="">{t("responsible.address_title")}</p>
					<p className="">{t("responsible.address")}</p>
					<p className="">{t("responsible.plz")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("data_protection_officer.title")}</h2>
					<p className="">{t("data_protection_officer.description1")}</p>
					<h3 className="mt-4 mb-2">
						{t("data_protection_officer.sub_title")}
					</h3>
					<p className="font-bold">{t("data_protection_officer.mail_title")}</p>
					<p className="">
						{t.rich("data_protection_officer.mail1", {
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

					<p className="font-bold">
						{t("data_protection_officer.address_title")}
					</p>
					<p className="">{t("data_protection_officer.position")}</p>
					<p className="">{t("data_protection_officer.address")}</p>
					<p className="">{t("data_protection_officer.plz")}</p>
					<br />
					<p className="">{t("data_protection_officer.description2")}</p>
					<h3 className="mt-4 mb-2">
						{t("data_protection_officer.sub_title2")}
					</h3>
					<p className="font-bold">{t("data_protection_officer.mail_title")}</p>
					<p className="">
						{t.rich("data_protection_officer.mail2", {
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
					<p className="font-bold">
						{t("data_protection_officer.address_title")}
					</p>
					<p className="">{t("data_protection_officer.position")}</p>
					<p className="">{t("data_protection_officer.address")}</p>
					<p className="">{t("data_protection_officer.plz")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("central_services.title")}</h2>
					<h3 className="mt-4 mb-2">{t("central_services.sub_title1")}</h3>
					<p className="">{t("central_services.description1")}</p>
					<br />
					<p className="">{t("central_services.name1")}</p>
					<p className="">{t("central_services.address1")}</p>
					<p className="">{t("central_services.plz1")}</p>
					<br />
					<h3 className="mt-4 mb-2">{t("central_services.sub_title2")}</h3>
					<p className="">{t("central_services.description2")}</p>
					<br />
					<p className="mb-2 font-bold">{t("central_services.list_title1")}</p>
					<ul className="list-disc lg:ps-6">
						{Object.keys(list1).map((key) => (
							<li key={key}>
								{t.rich(`central_services.list1.${key}`, {
									strong: (chunks) => <strong>{chunks}</strong>,
								})}
							</li>
						))}
					</ul>
					<br />
					<h3 className="mt-4 mb-2">{t("central_services.sub_title3")}</h3>
					<p className="">{t("central_services.description3")}</p>
					<br />
					<h3 className="mt-4 mb-2">{t("central_services.sub_title4")}</h3>
					<p className="">{t("central_services.description4")}</p>
					<br />
					<h3 className="mt-4 mb-2">{t("central_services.sub_title5")}</h3>
					<p className="">{t("central_services.description5")}</p>
					<br />
					<h3 className="mt-4 mb-2">{t("central_services.sub_title6")}</h3>
					<p className="">{t("central_services.description6_1")}</p>
					<br />
					<p className="">{t("central_services.description6_2")}</p>
					<br />
					<p className="">{t("central_services.description6_3")}</p>
					<br />
					<p className="">{t("central_services.description6_4")}</p>
					<br />
					<h3 className="mt-4 mb-2">{t("central_services.sub_title7")}</h3>
					<p className="">
						{t.rich("central_services.description7", {
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
			</section>
		</div>
	);
}
