"use client";

import { useState } from "react";

export default function Screenshot() {
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleGenerate() {
		try {
			setLoading(true);
			setError(null);

			const res = await fetch("/api/mapfish", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
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
