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
		"idle" | "loading" | "granted" | "denied"
	>("idle");
	const [lat, setLat] = useState<number | null>(null);
	const [long, setLong] = useState<number | null>(null);

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
			</div>
		</div>
	);
};

export default LocationButton;
