"use client";

import { cn } from "@/lib/utils";
import { Button, Spinner } from "berlin-ui-library";
import { useEffect, useRef, useState } from "react";

type PdfPayload = {
	type: "PDF_PAYLOAD";
	blob: Blob;
	filename: string;
	title?: string;
};

export default function PdfViewerPage() {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [filename, setFilename] = useState<string>("Document.pdf");
	const hideToolbar = true;
	const initializedRef = useRef<boolean>(false);
	const urlRef = useRef<string | null>(null);

	// Clean up object URL
	useEffect(() => {
		return () => {
			if (urlRef.current) URL.revokeObjectURL(urlRef.current);
			urlRef.current = null;
		};
	}, []);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			// security: accept only same-origin messages
			if (event.origin !== window.location.origin || initializedRef.current)
				return;

			const data = event.data as PdfPayload;

			if (data?.type !== "PDF_PAYLOAD") return;
			if (!(data.blob instanceof Blob)) return;

			// update tab title
			document.title = data.title || "Document.pdf";

			// update filename
			setFilename(data.title || "Document.pdf");

			// create URL (revoke old one)
			if (urlRef.current) URL.revokeObjectURL(urlRef.current);
			const url = URL.createObjectURL(data.blob);
			urlRef.current = url;
			setPdfUrl(url);
			initializedRef.current = true;
		};

		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	const download = () => {
		if (!pdfUrl) return;

		const a = document.createElement("a");
		a.href = pdfUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	return (
		<div className="h-screen w-screen">
			<div
				className={cn(
					"flex min-h-[70px] items-center px-4",
					!pdfUrl && "invisible",
				)}
			>
				<div className="flex-1 truncate text-sm font-medium">{filename}</div>
				<Button variant="download" onClick={download}>
					Report herunterladen
				</Button>
			</div>
			{!pdfUrl ? (
				<div className="w-full p-5">
					<Spinner text="PDF wird geladen" position="right" size="small" />
				</div>
			) : (
				<>
					<iframe
						src={
							hideToolbar
								? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`
								: pdfUrl
						}
						className="h-[calc(100%-70px)] w-full"
						title={filename}
					/>
				</>
			)}
		</div>
	);
}
