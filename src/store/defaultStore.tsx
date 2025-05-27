// store/defaultStore.tsx
import { create } from "zustand";

type StoreState = {
	currentUserAddress: string | null;
	currentfloodCheckState: string | null;
	setCurrentUserAddress: (address: string) => void;
	resetCurrentUserAddress: () => void;
	setCurrentfloodCheckState: (state: string) => void;
	resetCurrentfloodCheckState: () => void;
};

const useStore = create<StoreState>((set) => ({
	currentUserAddress: null,
	currentfloodCheckState: null,
	setCurrentUserAddress: (address) => set({ currentUserAddress: address }),
	resetCurrentUserAddress: () => set({ currentUserAddress: null }),
	setCurrentfloodCheckState: (state) => set({ currentfloodCheckState: state }),
	resetCurrentfloodCheckState: () => set({ currentfloodCheckState: null }),
}));

export default useStore;
