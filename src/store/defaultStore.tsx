import { create } from "zustand";
import { AddressResult, HazardData } from "@/lib/types";

type StoreState = {
	// State
	currentUserAddress: AddressResult | null;
	currentfloodCheckState: string | null;
	hazardData: HazardData | null;
	isLoadingHazardData: boolean;

	// Actions
	setCurrentUserAddress: (address: AddressResult) => void;
	resetCurrentUserAddress: () => void;
	setCurrentfloodCheckState: (state: string) => void;
	resetCurrentfloodCheckState: () => void;
	setHazardData: (data: HazardData) => void;
	resetHazardData: () => void;
	setLoadingHazardData: (loading: boolean) => void;
};

const useStore = create<StoreState>((set) => ({
	currentUserAddress: null,
	currentfloodCheckState: null,
	hazardData: null,
	isLoadingHazardData: false,
	setCurrentUserAddress: (address) => set({ currentUserAddress: address }),
	resetCurrentUserAddress: () => set({ currentUserAddress: null }),
	setCurrentfloodCheckState: (state) => set({ currentfloodCheckState: state }),
	resetCurrentfloodCheckState: () => set({ currentfloodCheckState: null }),
	setHazardData: (data) => set({ hazardData: data }),
	resetHazardData: () => set({ hazardData: null }),
	setLoadingHazardData: (loading) => set({ isLoadingHazardData: loading }),
}));

export default useStore;
