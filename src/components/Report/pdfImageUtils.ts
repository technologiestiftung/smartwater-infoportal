/* eslint-disable */

import html2canvas from "html2canvas-pro";
import { PDFKeys } from "./types";

async function blobToDataUrl(blob: Blob): Promise<string> {
	return await new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result));
		r.onerror = () => reject(r.error);
		r.readAsDataURL(blob);
	});
}

async function loadImageAsBase64(url: string): Promise<string | null> {
	try {
		const res = await fetch(url, { mode: "cors" }).catch(() => null);

		// If fetch failed (CORS, network error, etc.)
		if (!res || !res.ok) {
			throw new Error("Image fetch failed or blocked by CORS:" + url);
		}

		const blob = await res.blob();

		return await new Promise((resolve) => {
			const reader = new FileReader();

			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = () => {
				console.error("Error converting blob to Base64");
				resolve(null);
			};

			reader.readAsDataURL(blob);
		});
	} catch (err) {
		throw new Error("Error loading image: " + err);
	}
}

async function getAspectRatio(
	imageSrc: string,
): Promise<{ aspectRatioWidthHeight: number; aspectRatioHeightWidth: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = function () {
			const originalWidth = img.naturalWidth;
			const originalHeight = img.naturalHeight;
			const aspectRatioWidthHeight = originalWidth / originalHeight;
			const aspectRatioHeightWidth = originalHeight / originalWidth;

			resolve({ aspectRatioWidthHeight, aspectRatioHeightWidth });
		};
		img.onerror = function () {
			reject(new Error(`Failed to load image. URL: ${imageSrc}`));
		};
		img.src = imageSrc;
	});
}

export async function captureElementToBlob(
	selectorOrId: string,
): Promise<Blob | null> {
	const id = selectorOrId.startsWith("#")
		? selectorOrId.slice(1)
		: selectorOrId;
	const el = document.getElementById(id);
	if (!el) throw new Error(`Element with id #${id} not found.`);
	try {
		const canvas = await html2canvas(el, {
			scale: 1,
			useCORS: true,
			backgroundColor: "white",
			logging: false,
			removeContainer: true,
		});

		return await new Promise<Blob | null>((resolve) =>
			canvas.toBlob((b) => resolve(b), "image/jpeg", 1),
		);
	} catch (e) {
		throw new Error(`captureElementToBlob failed for #${id}: ${e}`);
	}
}

export const getImage = async (imageSRC: string, pdfKeys: PDFKeys) => {
	if (!imageSRC || !pdfKeys)
		throw new Error("imageSRC and pdfKeys are required.");

	let imageData: string | null = null;

	if (imageSRC.startsWith("#")) {
		const blob = pdfKeys?.[imageSRC];
		if (!(blob instanceof Blob)) {
			throw new Error(`No blob found in pdfKeys for ${imageSRC}.`);
		}
		imageData = await blobToDataUrl(blob);
	} else {
		imageData = await loadImageAsBase64(imageSRC);
	}

	if (!imageData) throw new Error(`Failed to load image data for ${imageSRC}.`);

	const ratio = await getAspectRatio(imageData);

	return {
		image: imageData,
		aspectRatioWidthHeight: ratio.aspectRatioWidthHeight,
		aspectRatioHeightWidth: ratio.aspectRatioHeightWidth,
	};
};
