"use client";

import { After, Before, Serious } from "@/components/Handlungsempfehlungen";
import Emergency from "@/components/Handlungsempfehlungen/Emergency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "berlin-ui-library";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Recommendations() {
	const t = useTranslations();
	return (
		<div className="relative flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
			<h1 className="">{t("recommendations.pageTitle")}</h1>
			<p className="">{t("recommendations.intro")}</p>
			<div className="relative w-full">
				<div className="relative hidden aspect-[4.7/1] w-[90%] lg:block">
					<Image
						src="/Handlungsempfehlungen-desktop.jpg"
						alt="Alt Tag for Graphic"
						fill
						className="object-contain"
					/>
				</div>
				<div className="relative aspect-[1/1.49] w-full lg:hidden">
					<Image
						src="/Handlungsempfehlungen-mobile.jpg"
						alt="Alt Tag for Graphic"
						fill
						className="object-contain"
					/>
				</div>
			</div>
			<Tabs defaultValue="before" className="">
				<TabsList>
					<TabsTrigger value="before" tabColor="#9BCFAF">
						{t("recommendations.timeline.before")}
					</TabsTrigger>
					<TabsTrigger value="emergency" tabColor="#FFE70E">
						{t("recommendations.timeline.emergency")}
					</TabsTrigger>
					<TabsTrigger value="serious" tabColor="#F5B4CB">
						{t("recommendations.timeline.serious")}
					</TabsTrigger>
					<TabsTrigger value="after" tabColor="#AAC9E7">
						{t("recommendations.timeline.after")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="before">
					<div className="mt-6">
						<Before />
					</div>
				</TabsContent>
				<TabsContent value="emergency">
					<div className="mt-6">
						<Emergency />
					</div>
				</TabsContent>
				<TabsContent value="serious">
					<div className="mt-6">
						<Serious />{" "}
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
