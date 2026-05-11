/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { Button } from "berlin-ui-library";
import { FC, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

interface LocationButtonProps {
	coordinatesChanged?: (lat: number, lon: number) => void;
}
const LocationButton: FC<LocationButtonProps> = ({ coordinatesChanged }) => {
	const [status, setStatus] = useState<
		"idle" | "loading" | "granted" | "denied" | "outside-bbox" | "not-available"
	>("idle");
	const [lat, setLat] = useState<number | null>(null);
	const [long, setLong] = useState<number | null>(null);

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
			setStatus("not-available");
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

	async function watchLocationPermission() {
		try {
			const permission = await navigator.permissions.query({
				name: "geolocation",
			});

			permission.onchange = () => {
				if (permission.state === "granted") {
					// requestLocation();
					setStatus("idle");
				}
				if (permission.state === "denied") {
					setStatus("denied");
				}
			};
		} catch {
			// Safari does not support navigator.permissions
		}
	}

	useEffect(() => {
		watchLocationPermission();
	}, []);

	useEffect(() => {
		if (lat !== null && long !== null) {
			const inside = isPointInBBox(long as number, lat as number);
			if (!inside) {
				setStatus("outside-bbox");
				return;
			}
			if (coordinatesChanged) {
				coordinatesChanged(lat as number, long as number);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lat, long]);

	return (
		<div className="mt-2">
			<div className="space-y-4">
				<Button
					className="flex cursor-pointer items-center gap-2 decoration-black"
					variant="link"
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					onClick={(e: any) => {
						e.preventDefault();
						requestLocation();
					}}
				>
					<FontAwesomeIcon
						icon={faMapMarkerAlt}
						className={`flex-shrink-0 text-[18px] text-black`}
					/>
					<p className="text-black">Aktuellen Standort benutzen</p>
				</Button>
				{status === "loading" && <p>Frage Standort ab…</p>}
				{status === "denied" && (
					<p className="text-red-600">
						Sie haben die automatische Standorterkennung abgelehnt. Bitte passen
						Sie Ihre Browser-Einstellungen an.
					</p>
				)}
				{status === "not-available" && (
					<p className="text-red-600">
						Die automatische Standorterkennung ist mit diesem Browser leider
						nicht möglich.
					</p>
				)}
				{status === "outside-bbox" && (
					<p className="text-red-600">
						Ihre Adresse liegt außerhalb von Berlin. Bitte geben Sie eine
						Berliner Adresse ein, um den HochwasserCheck Berlin zu starten.
					</p>
				)}
			</div>
		</div>
	);
};

export default LocationButton;
