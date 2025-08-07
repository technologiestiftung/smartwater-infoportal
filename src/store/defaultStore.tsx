// store/defaultStore.tsx
import { CoordinatesProps, DangerProps } from "@/types/map";
import { create } from "zustand";

type StoreState = {
	currentUserAddress: string | null;
	currentfloodCheckState: string | null;
	setCurrentUserAddress: (address: string) => void;
	resetCurrentUserAddress: () => void;
	currentUserCoordinates: CoordinatesProps | null;
	setCurrentUserCoordinates: (coordinates: CoordinatesProps) => void;
	currentDangerLevel: DangerProps | null;
	setCurrentDangerLevel: (danger: DangerProps) => void;
	setCurrentfloodCheckState: (state: string) => void;
	resetCurrentfloodCheckState: () => void;
};

const useStore = create<StoreState>((set) => ({
	currentUserAddress: null,
	currentfloodCheckState: null,
	setCurrentUserAddress: (address) => set({ currentUserAddress: address }),
	resetCurrentUserAddress: () => set({ currentUserAddress: null }),
	currentUserCoordinates: null,
	setCurrentUserCoordinates: (coordinates) =>
		set({ currentUserCoordinates: coordinates }),
	currentDangerLevel: null,
	setCurrentDangerLevel: (danger) => set({ currentDangerLevel: danger }),
	setCurrentfloodCheckState: (state) => set({ currentfloodCheckState: state }),
	resetCurrentfloodCheckState: () => set({ currentfloodCheckState: null }),
}));

export default useStore;
