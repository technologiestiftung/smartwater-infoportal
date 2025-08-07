// store/defaultStore.tsx
import { CoordinatesProps, DangerProps } from "@/types/map";
import { create } from "zustand";
import { AddressResult, LocationData } from "@/lib/types";

type StoreState = {
	// State
	currentUserAddress: AddressResult | null;
	currentfloodCheckState: string | null;
	locationData: LocationData | null;
	isLoadingLocationData: boolean;

	// Actions
	setCurrentUserAddress: (address: AddressResult) => void;
	resetCurrentUserAddress: () => void;
	currentUserCoordinates: CoordinatesProps | null;
	setCurrentUserCoordinates: (coordinates: CoordinatesProps) => void;
	currentDangerLevel: DangerProps | null;
	setCurrentDangerLevel: (danger: DangerProps) => void;
	setCurrentfloodCheckState: (state: string) => void;
	resetCurrentfloodCheckState: () => void;
	setLocationData: (data: LocationData) => void;
	resetLocationData: () => void;
	setLoadingLocationData: (loading: boolean) => void;
};

const useStore = create<StoreState>((set) => ({
	currentUserAddress: null,
	currentfloodCheckState: null,
	locationData: null,
	isLoadingLocationData: false,
	setCurrentUserAddress: (address) => set({ currentUserAddress: address }),
	resetCurrentUserAddress: () => set({ currentUserAddress: null }),
	currentUserCoordinates: null,
	setCurrentUserCoordinates: (coordinates) =>
		set({ currentUserCoordinates: coordinates }),
	currentDangerLevel: null,
	setCurrentDangerLevel: (danger) => set({ currentDangerLevel: danger }),
	setCurrentfloodCheckState: (state) => set({ currentfloodCheckState: state }),
	resetCurrentfloodCheckState: () => set({ currentfloodCheckState: null }),
	setLocationData: (data) => set({ locationData: data }),
	resetLocationData: () => set({ locationData: null }),
	setLoadingLocationData: (loading) => set({ isLoadingLocationData: loading }),
}));

export default useStore;
