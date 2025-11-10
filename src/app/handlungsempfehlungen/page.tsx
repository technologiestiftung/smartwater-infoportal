"use client";

import { After, Before, Serious } from "@/components/Handlungsempfehlungen";
import Emergency from "@/components/Handlungsempfehlungen/Emergency";
import {
	Image,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "berlin-ui-library";
import { useMessages, useTranslations } from "next-intl";
import Link from "next/link";
import NextImage from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type TocMap = Record<string, string>;

export default function Recommendations() {
	const t = useTranslations();
	const content = useMessages() as {
		recommendations: {
			introList: TocMap;
		};
	};
	const introList = content.recommendations.introList;
	return (
		<div className="relative flex w-full flex-col justify-start gap-6 px-5 py-8 lg:px-0">
			<h1 className="">{t("recommendations.pageTitle")}</h1>
			<p className="">
				{t.rich("recommendations.intro", {
					link1: (chunks) => (
						<Link
							href="/hintergrund-informationen#anker3"
							rel="noopener noreferrer"
							className="text-text-link underline"
						>
							{chunks}
						</Link>
					),
					link2: (chunks) => (
						<Link
							className="text-text-link"
							href="https://www.gesetze-im-internet.de/whg_2009/__5.html"
							target="_blank"
							rel="noopener noreferrer"
						>
							{chunks}
						</Link>
					),
				})}
			</p>
			<ul className="list-none space-y-4 lg:ps-12">
				{Object.entries(introList).map(([key, label]) => (
					<li key={key} className="flex items-start gap-2">
						<FontAwesomeIcon
							icon={faCheck}
							className={`flex-shrink-0 text-[18px]`}
						/>
						<span>{label}</span>
					</li>
				))}
			</ul>
			<div className="relative w-full">
				<div className="relative hidden aspect-[4.7/1] w-[90%] lg:block">
					<NextImage
						src="/Handlungsempfehlungen-desktop.jpg"
						alt="???"
						fill
						className="object-contain"
					/>
				</div>
				<div className="relative aspect-[1/1.49] w-full lg:hidden">
					<NextImage
						src="/Handlungsempfehlungen-mobile.jpg"
						alt="???"
						fill
						className="object-contain"
					/>
				</div>
			</div>
			<Image
				// className="-mx-5 hidden w-screen max-w-none lg:-mx-0 lg:block lg:w-auto"
				className="hidden w-[calc(100%+2.5rem)] -translate-x-[1.25rem] lg:block lg:w-full lg:translate-x-0"
				src="/Handlungsempfehlungen-desktop.jpg"
				alt={t("recommendations.introImage.alt")}
				caption={t("recommendations.introImage.caption")}
				copyright={t("recommendations.introImage.copyright")}
				withZoomBox
			/>
			<Image
				// className="-mx-5 w-screen max-w-none lg:-mx-0 lg:hidden lg:w-auto"
				className="w-[calc(100%+2.5rem)] -translate-x-[1.25rem] lg:hidden lg:w-full lg:translate-x-0"
				src="/Handlungsempfehlungen-mobile.jpg"
				alt={t("recommendations.introImage.alt")}
				caption={t("recommendations.introImage.caption")}
				copyright={t("recommendations.introImage.copyright")}
				withZoomBox
			/>
			<p className="">
				{t.rich("recommendations.intro2", {
					link1: (chunks) => (
						<Link
							href="/hintergrund-informationen#anker4"
							rel="noopener noreferrer"
							className="text-text-link underline"
						>
							{chunks}
						</Link>
					),
					link2: (chunks) => (
						<Link
							href="/#hochwasser-check"
							rel="noopener noreferrer"
							className="text-text-link underline"
						>
							{chunks}
						</Link>
					),
				})}
			</p>
			<Tabs defaultValue="before" className="mt-12">
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
