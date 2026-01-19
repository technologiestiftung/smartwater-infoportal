"use client";

import { searchAddresses } from "@/server/actions/searchAddresses";
import { Button } from "berlin-ui-library";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";

interface LocationButtonProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resultsLoaded?: (results: any[]) => void;
}
const LocationButton: FC<LocationButtonProps> = ({ resultsLoaded }) => {
	const [status, setStatus] = useState<
		"idle" | "loading" | "granted" | "denied" | "outside-bbox"
	>("idle");
	const [lat, setLat] = useState<number | null>(null);
	const [long, setLong] = useState<number | null>(null);
	const isDev = false; // process.env.NODE_ENV === "development";

	const bbox: [number, number, number, number] = [
		13.091992716067702, 52.33488609760638, 13.742786470433, 52.67626223889507,
	];

	function isPointInBBox(lonArg: number, latArg: number): boolean {
		const [minLon, minLat, maxLon, maxLat] = bbox;

		return (
			typeof lonArg === "number" &&
			typeof latArg === "number" &&
			lonArg >= minLon &&
			lonArg <= maxLon &&
			latArg >= minLat &&
			latArg <= maxLat
		);
	}

	async function requestLocation() {
		setStatus("loading");

		// Check if the browser supports geolocation
		if (!("geolocation" in navigator)) {
			setStatus("denied");
			return;
		}

		// Ask permission explicitly
		try {
			const permission = await navigator.permissions.query({
				name: "geolocation",
			});

			if (permission.state === "denied") {
				setStatus("denied");
				return;
			}
		} catch {
			// Safari does not support permissions API → continue normally
		}

		// Attempt to get position
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setStatus("granted");
				setLat(pos.coords.latitude);
				setLong(pos.coords.longitude);
			},
			(err) => {
				console.error("Error getting location:", err);
				setStatus("denied");
			},
			{
				enableHighAccuracy: true,
				timeout: 8000,
			},
		);
	}

	useEffect(() => {
		const reverseSearch = async () => {
			const inside = isPointInBBox(long as number, lat as number);
			if (!inside) {
				setStatus("outside-bbox");
				return;
			}
			const results = await searchAddresses("", lat as number, long as number);
			if (resultsLoaded) {
				resultsLoaded(results ? results : []);
			}
		};
		if (lat !== null && long !== null) {
			reverseSearch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lat, long]);

	return (
		<div className="mt-2">
			<div className="space-y-4">
				<Button
					className="flex cursor-pointer items-center gap-2"
					variant="link"
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					onClick={(e: any) => {
						e.preventDefault();
						requestLocation();
					}}
				>
					<Image
						src="/userLocation.svg"
						alt={"Benutzerstandort Icon"}
						width={24}
						height={24}
					/>
					<p>Aktuellen Standort benutzen</p>
				</Button>
				{status === "loading" && <p>Frage Standort ab…</p>}
				{status === "denied" && (
					<p className="text-red-600">
						Standort abgelehnt. Bitte Browser-Einstellungen prüfen.
					</p>
				)}
				{status === "outside-bbox" && (
					<p className="text-red-600">
						Ihre Adresse liegt außerhalb von Berlin. Bitte geben Sie eine
						Berliner Adresse ein, um den WasserCheck Berlin zu starten.
					</p>
				)}
				{isDev && (
					<>
						<hr className="my-6" />
						<div className="space-y-4">
							<div className="flex">
								<div>
									<label className="mb-1 block font-medium">Latitude</label>
									<input
										type="number"
										step="any"
										placeholder="Latitude"
										value={lat !== null ? lat : ""}
										onChange={(e) =>
											setLat(
												e.target.value === "" ? null : Number(e.target.value),
											)
										}
										className="mr-2 rounded border p-2"
									/>
								</div>
								<div>
									<label className="mb-1 block font-medium">Longitude</label>
									<input
										type="number"
										step="any"
										placeholder="Longitude"
										value={long !== null ? long : ""}
										onChange={(e) =>
											setLong(
												e.target.value === "" ? null : Number(e.target.value),
											)
										}
										className="rounded border p-2"
									/>
								</div>
							</div>
							<Button
								variant="link"
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								onClick={(e: any) => {
									e.preventDefault();
									setLat(null);
									setLong(null);
									setStatus("idle");
								}}
							>
								Koordinaten Löschen
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default LocationButton;
