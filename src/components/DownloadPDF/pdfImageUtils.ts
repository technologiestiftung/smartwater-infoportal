/* eslint-disable */

import html2canvas from "html2canvas-pro";

function getBase64ImageSize(dataUrl: string): {
	bytes: number;
	kilobytes: number;
	megabytes: number;
} {
	if (!dataUrl.startsWith("data:image")) {
		throw new Error("Invalid data URL");
	}

	const base64String = dataUrl.split(",")[1];
	const byteLength =
		(base64String.length * 3) / 4 -
		(base64String.endsWith("==") ? 2 : base64String.endsWith("=") ? 1 : 0);

	return {
		bytes: byteLength,
		kilobytes: byteLength / 1024,
		megabytes: byteLength / (1024 * 1024),
	};
}

async function downscaleImage(src: string, maxWidth = 500): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const scale = maxWidth / img.width;
			const canvas = document.createElement("canvas");
			canvas.width = maxWidth;
			canvas.height = img.height * scale;

			const ctx = canvas.getContext("2d");
			if (!ctx) return reject("Canvas context error");

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL("image/jpeg", 0.7));
		};
		img.onerror = reject;
		img.crossOrigin = "anonymous";
		img.src = src;
	});
}

async function loadImageAsBase64(url: string): Promise<string | null> {
	try {
		const res = await fetch(url, { mode: "cors" }).catch(() => null);

		// If fetch failed (CORS, network error, etc.)
		if (!res || !res.ok) {
			console.warn("Image fetch failed or blocked by CORS:", url);
			return null;
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
		// Any unexpected error
		console.warn("loadImageAsBase64 failed:", err);
		return null;
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

export const getImage = async (imageSRC: string) => {
	if (!imageSRC) return null;
	let image;
	if (imageSRC.startsWith("#")) {
		image = document.getElementById(imageSRC.replace("#", ""));
		if (!image) return null;
		const html2canvasImage = await html2canvas(image, { scale: 1 });
		image = html2canvasImage.toDataURL("image/jpeg");
	} else {
		image = await loadImageAsBase64(imageSRC);
	}
	if (!image) return null;
	const downscaledImage = await downscaleImage(image);
	const getSizeMakeImage = getBase64ImageSize(image);
	const getImageAspectRatio = await getAspectRatio(image);
	const getSizeDownscaledImage = getBase64ImageSize(downscaledImage);
	return {
		id: imageSRC,
		image,
		downscaledImage,
		getSizeMakeImage,
		getSizeDownscaledImage,
		aspectRatioWidthHeight: getImageAspectRatio.aspectRatioWidthHeight,
		aspectRatioHeightWidth: getImageAspectRatio.aspectRatioHeightWidth,
	};
};
