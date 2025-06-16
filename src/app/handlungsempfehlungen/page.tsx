"use client";

import { After, Before, During } from "@/components/Handlungsempfehlungen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "berlin-ui-library";
import { useTranslations } from "next-intl";

export default function Recommendations() {
	const t = useTranslations();
	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
			<h1 className="">{t("recommendations.pageTitle")}</h1>
			<p className="">{t("recommendations.intro")}</p>
			<h2 className="">{t("recommendations.timeline.title")}</h2>
			<Tabs defaultValue="before" className="">
				<TabsList>
					<TabsTrigger value="before">
						{t("recommendations.timeline.before")}
					</TabsTrigger>
					<TabsTrigger value="during">
						{t("recommendations.timeline.during")}
					</TabsTrigger>
					<TabsTrigger value="after">
						{t("recommendations.timeline.after")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="before">
					<div className="mt-6">
						<Before />
					</div>
				</TabsContent>
				<TabsContent value="during">
					<div className="mt-6">
						<During />{" "}
					</div>
				</TabsContent>
				<TabsContent value="after">
					<div className="mt-6">
						<After />{" "}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
