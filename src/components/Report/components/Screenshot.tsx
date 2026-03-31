"use client";

import { getMapfishCenterAndScale } from "@/lib/geometry";
import { useState } from "react";

export default function Screenshot() {
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleGenerate() {
		try {
			setLoading(true);
			setError(null);

			const testingValue = getMapfishCenterAndScale({
				type: "MultiPolygon",
				coordinates: [
					[
						[
							[391937.56, 5826168.161],
							[391949.627, 5826176.46],
							[391960.389, 5826160.827],
							[391948.302, 5826152.548],
							[391937.56, 5826168.161],
						],
					],
				],
			});

			console.log("testingValue :>> ", testingValue);

			const res = await fetch("/api/mapfish", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(testingValue),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(
					data?.error || "Screenshot konnte nicht erzeugt werden",
				);
			}

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			setImageUrl(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unbekannter Fehler");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="border p-6">
			<button
				onClick={handleGenerate}
				disabled={loading}
				className="cursor-pointer"
			>
				{loading ? "Erzeuge Screenshot..." : "Mapfish Screenshot erstellen"}
			</button>

			{error && <p style={{ color: "red" }}>{error}</p>}

			{imageUrl && (
				<div style={{ marginTop: 24 }}>
					<img
						src={imageUrl}
						alt="MapFish Screenshot"
						style={{ maxWidth: "100%" }}
					/>
				</div>
			)}
		</div>
	);
}
