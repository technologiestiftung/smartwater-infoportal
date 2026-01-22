import { LocationData, HazardLevel } from "@/lib/types";
import { mapScaleToHazardLevel } from "@/lib/utils";

export type HazardEntity = {
	name: string;
	hazardLevel: HazardLevel;
	showSubLabel?: boolean;
	subHazardLevel?: string;
};

export function getHazardEntities(
	locationData: LocationData | null,
): HazardEntity[] | null {
	if (!locationData || !locationData.found || !locationData.building) {
		return null;
	}

	let subHazardLevel = "no";
	if (locationData.building.floodZoneIndex === null) {
		subHazardLevel = "floodZoneIndexError";
	} else if ((locationData.building.floodZoneIndex || 0) > 0) {
		subHazardLevel = "yes";
	}

	return [
		{
			name: "heavyRain",
			hazardLevel: mapScaleToHazardLevel(
				locationData.building.starkregenGefährdung || 0,
			),
		},
		{
			name: "fluvialFlood",
			hazardLevel: mapScaleToHazardLevel(
				locationData.building.hochwasserGefährdung || 0,
			),
			showSubLabel: true,
			subHazardLevel,
		},
	];
}
