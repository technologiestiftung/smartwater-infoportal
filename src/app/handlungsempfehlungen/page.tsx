"use client";

import {
	Button,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "berlin-ui-library";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Recommendations() {
	const t = useTranslations();
	return (
		<div className="flex w-full flex-col justify-start gap-6">
			<Link href="/">
				<Button variant="back-link" className="self-start">
					{t("common.backToStart")}
				</Button>
			</Link>
			<h1 className="">{t("recommendations.pageTitle")}</h1>
			<p className="">{t("recommendations.intro")}</p>
			<h2 className="text-accent">{t("recommendations.timeline.title")}</h2>
			<p className="text-accent">{t("recommendations.timeline.description")}</p>
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
					<div className="flex flex-col gap-4">
						<h2 className="">{t("recommendations.beforeEvent.title")}</h2>
						<h3 className="">
							{t("recommendations.beforeEvent.personalPreparedness.title1")}
						</h3>
						<p className="">
							{t("recommendations.beforeEvent.personalPreparedness.item1")}
						</p>
						<h3 className="">
							{t("recommendations.beforeEvent.personalPreparedness.title2")}
						</h3>
						<p className="">
							{t("recommendations.beforeEvent.personalPreparedness.item2")}
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
