"use client";
import { FC, useState } from "react";
import { Button } from "berlin-ui-library";
import { LocationData } from "@/lib/types";
import { getHazardData } from "@/server/actions/getHazardData";
import { searchAddresses } from "@/server/actions/searchAddresses";

interface IntersectButtonProps {}

const testingAddresses = [
	"Majakowskiring 9",
	"Grunewaldstraße 61-62",
	"Brandensteinweg 66",
];

const SCENARIO_LAYER = {
	// SRGK_RARE_HEAVY_RAIN: {
	// 	wfsUrl: "https://gdi.berlin.de/services/wfs/ua_srgk",
	// 	typeName: "ua_srgk:ba_fliessgeschwindigkeit_selten",
	// },
	// SRGK_UNCOMMON_HEAVY_RAIN: {
	// 	wfsUrl: "https://gdi.berlin.de/services/wfs/ua_srgk",
	// 	typeName: "ua_srgk:bb_fliessgeschwindigkeit_aussergewoehnlich",
	// },
	// SRGK_EXTREME_HEAVY_RAIN: {
	// 	wfsUrl: "https://gdi.berlin.de/services/wfs/ua_srgk",
	// 	typeName: "ua_srgk:bc_fliessgeschwindigkeit_extrem",
	// },
	SRHK_UNCOMMON_HEAVY_RAIN: {
		wfsUrl: "https://gdi.berlin.de/services/wfs/ua_srhk",
		// typeName: "ua_srhk:da_fr_aussergewoehnlich",
		typeName: "ua_srhk:dc_wasserstand_aussergew_kostra",
	},
	SRHK_EXTREME_HEAVY_RAIN: {
		wfsUrl: "https://gdi.berlin.de/services/wfs/ua_srhk",
		// typeName: "ua_srhk:ea_fr_extrem_max100mm",
		typeName: "ua_srhk:ec_wasserstand_extrem_max100mm",
	},
	/* FREQUENT_FLOOD: {
		wfsUrl: "https://gdi.berlin.de/services/wfs/ua_hochwassergefahrenkarten",
		typeName: "ua_hochwassergefahrenkarten:a_hwgk_hoch",
	},
	AVERAGE_FREQUENT_FLOOD: {
		wfsUrl: "https://gdi.berlin.de/services/wfs/ua_hochwassergefahrenkarten",
		typeName: "ua_hochwassergefahrenkarten:b_hwgk_mittel",
	},
	RARE_FREQUENT_FLOOD: {
		wfsUrl: "https://gdi.berlin.de/services/wfs/ua_hochwassergefahrenkarten",
		typeName: "ua_hochwassergefahrenkarten:c_hwgk_niedrig",
	},
	FLOOD_ZONE: {
		wfsUrl: "https://gdi.berlin.de/services/wfs/ua_uesg",
		typeName: "ua_uesg:c_ueberschwemmungsgebiete",
	}, */
};

const TestingIntersectButton: FC<IntersectButtonProps> = () => {
	const [text, setText] = useState("");

	async function handleClick() {
		if (!text) {
			return console.error("No address provided");
		}
		const result = await searchAddresses(text);

		if (!result.ok) {
			return console.error("Address search failed:", result.code);
		}
		console.log("result.data :>> ", result.data);
		const { lat, lon } = result.data[0] || {};

		if (!lat || !lon) {
			return console.error("No coordinates found");
		}
		let locationData: LocationData | null = null;
		try {
			const longitude = parseFloat(lon);
			const latitude = parseFloat(lat);
			locationData = await getHazardData(longitude, latitude);
			console.log("setLocationData ✅✅✅", locationData);
		} catch (error) {
			console.error("Error in checkHazard function:", error);
		}
		const takeOutline = true;
		if (
			!locationData?.building?.geometry ||
			!locationData?.building?.outlineBufferGeometry
		) {
			return console.error(
				"No building geometry found for the provided coordinates",
			);
		}
		const requests = Object.entries(SCENARIO_LAYER).map(([key, config]) =>
			fetch("/api/intersect-features", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					polygon: takeOutline
						? locationData?.building?.outlineBufferGeometry
						: locationData?.building?.geometry,
					wfsUrl: config.wfsUrl,
					typeName: config.typeName,
				}),
			})
				.then((res) => res.json())
				.then((data) => ({ key, data })),
		);

		const results = await Promise.all(requests);

		console.log("[TestingIntersectButton] all results::", results);
	}

	return (
		<div className="flex flex-col gap-4">
			{testingAddresses.map((addr) => (
				<div
					className="w-fit cursor-pointer bg-[#f1f1f1] p-2"
					key={addr}
					onClick={() => setText(addr)}
				>
					Teste mit {addr}
				</div>
			))}
			<input
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Adresse eingeben"
				className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			<Button onClick={handleClick}>
				{!!text ? `Adresse: ${text}` : "Adresse abfragen"}
			</Button>
		</div>
	);
};

export default TestingIntersectButton;
