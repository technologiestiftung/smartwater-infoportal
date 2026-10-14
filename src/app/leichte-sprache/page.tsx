"use client";
import { useMessages, useTranslations } from "next-intl";

type Block =
	| { type: "h2" | "h3" | "p" | "strong"; text: string }
	| { type: "ul"; items: string[] }
	| { type: "img"; src: string; alt: string };

function renderBlock(block: Block, i: number) {
	switch (block.type) {
		case "h2":
			return (
				<h2 key={i} className="mt-6">
					{block.text}
				</h2>
			);
		case "h3":
			return (
				<h3 key={i} className="mt-4">
					{block.text}
				</h3>
			);
		case "strong":
			return (
				<p key={i} className="font-bold">
					{block.text}
				</p>
			);
		case "ul":
			return (
				<ul key={i} className="ml-6 list-disc">
					{block.items.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			);
		case "img":
			return (
				<img
					key={i}
					src={block.src}
					alt={block.alt}
					className="h-auto max-w-full self-start"
				/>
			);
		default:
			return <p key={i}>{block.text}</p>;
	}
}

export default function LeichteSprache() {
	const t = useTranslations("leichteSprache");
	const { leichteSprache } = useMessages() as {
		leichteSprache: { blocks: Block[] };
	};

	return (
		<div className="flex w-full flex-col justify-start gap-6 px-5 pt-8 pb-16 lg:px-0">
			<section className="flex flex-col gap-4 text-lg leading-relaxed">
				<h1>{t("pageTitle")}</h1>
				{leichteSprache.blocks.map(renderBlock)}
			</section>
		</div>
	);
}
