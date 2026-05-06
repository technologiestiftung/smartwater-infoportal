"use client";
import { useTranslations } from "next-intl";
import { Link } from "berlin-ui-library";

export default function Impressum() {
	const t = useTranslations("impressum");

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 pt-8 pb-16 lg:px-0">
			<section className="flex flex-col gap-10">
				<h1 className="">{t("pageTitle")}</h1>
				<div>
					<h2 className="mb-2">{t("publisher.title")}</h2>
					<p className="">{t("publisher.name")}</p>
					<p className="">{t("publisher.address")}</p>
					<p className="">{t("publisher.plz")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("authorized.title")}</h2>
					<p className="">{t("authorized.position")}</p>
					<p className="">{t("authorized.name")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("content_responsible.title")}</h2>
					<p className="">{t("content_responsible.name")}</p>
					<p className="">{t("content_responsible.position")}</p>
					<p className="">{t("content_responsible.tel")}</p>
					<p className="">
						{t.rich("content_responsible.mail", {
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
				</div>
				<div>
					<h3 className="mb-2">{t("tax_id.title")}</h3>
					<p className="">{t("tax_id.number")}</p>
				</div>
				<div>
					<p className="">
						{t.rich("online_info", {
							link: (chunks) => (
								<Link
									href={`https://${chunks}`}
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
					<h2 className="mb-2">{t("technical_operations.title")}</h2>
					<p className="">{t("technical_operations.name")}</p>
					<p className="">{t("technical_operations.address")}</p>
					<p className="">{t("technical_operations.plz")}</p>
					<p className="">{t("technical_operations.tel")}</p>
					<p className="">
						{t.rich("technical_operations.mail", {
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
				</div>
				<div>
					<h2 className="mb-2">{t("privacy_policy.title")}</h2>
					<p className="">
						{t.rich("privacy_policy.description", {
							link1: (chunks) => (
								<Link
									href="https://www.berlin.de/sen/uvk/datenschutzerklaerung.844084.php"
									rel="noopener noreferrer"
									className="text-text-link underline"
								>
									{chunks}
								</Link>
							),
							link2: (chunks) => (
								<Link
									href="https://www.berlin.de/sen/uvk/presse/social-media/"
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
					<h2 className="mb-2">{t("disclaimer.title")}</h2>
					<p className="">{t("disclaimer.paragraph1")}</p>
					<br />
					<p className="">{t("disclaimer.paragraph2")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("copyright.title")}</h2>
					<p className="">{t("copyright.paragraph1")}</p>
					<br />
					<p className="">{t("copyright.paragraph2")}</p>
				</div>
				<div>
					<h2 className="mb-2">{t("contact.title")}</h2>
					<h3 className="mt-4 mb-2">{t("contact.sub1")}</h3>
					<p className="">{t("contact.description1")}</p>
					<p className="">{t("contact.tel")}</p>
					<p className="">
						{t.rich("contact.mail", {
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
					<h3 className="mt-4 mb-2">{t("contact.sub2")}</h3>
					<p className="">
						{t.rich("contact.description2", {
							link: (chunks) => (
								<Link
									href={`https://${chunks}`}
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
