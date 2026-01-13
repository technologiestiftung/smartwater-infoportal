import { CurrentUserAddress } from "../types";

function sortHouseFirst(results: CurrentUserAddress[]): CurrentUserAddress[] {
	return [...results].sort((a, b) => {
		const aIsHouse = a.type === "house";
		const bIsHouse = b.type === "house";
		if (aIsHouse === bIsHouse) {
			return 0;
		}
		return aIsHouse ? -1 : 1;
	});
}

export { sortHouseFirst };