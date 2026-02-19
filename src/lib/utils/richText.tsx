import { Link } from "berlin-ui-library";
import { ReactNode } from "react";

export type LinkMap = Record<string, { href: string; target?: string; variant?: string }>;
type RichTextComponents = Record<string, (chunks: ReactNode) => ReactNode>;

function buildLinkComponents(linkMap: LinkMap): RichTextComponents {
  return Object.fromEntries(
    Object.entries(linkMap).map(([key, { href, target = "_self", variant = "default" }]) => [
      key,
      (chunks: ReactNode) => (
        <Link href={href} target={target} rel="noopener noreferrer" variant={variant}>
          {chunks}
        </Link>
      ),
    ])
  );
}

export function richText(linkMap?: LinkMap): RichTextComponents {
  return {
    strong: (chunks) => <strong>{chunks}</strong>,
    em: (chunks) => <em>{chunks}</em>,
    ol: (chunks) => <ol className="ml-2 mt-1 list-inside list-decimal">{chunks}</ol>,
    ul: (chunks) => <ul className="list-inside list-disc">{chunks}</ul>,
    li: (chunks) => <li>{chunks}</li>,
    span: (chunks) => <span className="font-bold">{chunks}</span>,
    ...(linkMap ? buildLinkComponents(linkMap) : {}),
  };
}