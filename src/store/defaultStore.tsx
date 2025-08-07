// store/defaultStore.tsx
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
	setCurrentfloodCheckState: (state) => set({ currentfloodCheckState: state }),
	resetCurrentfloodCheckState: () => set({ currentfloodCheckState: null }),
	setLocationData: (data) => set({ locationData: data }),
	resetLocationData: () => set({ locationData: null }),
	setLoadingLocationData: (loading) => set({ isLoadingLocationData: loading }),
}));

export default useStore;
