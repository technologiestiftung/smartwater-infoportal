import { create } from "zustand";

const useStore = create((set) => ({
	currentUserAddress: null,
	currentfloodCheckState: null,
	setCurrentUserAddress: (address: string) =>
		set({ currentUserAddress: address }),
	resetCurrentUserAddress: () => set({ currentUserAddress: null }),
	setCurrentfloodCheckState: (state: string) =>
		set({ currentfloodCheckState: state }),
	resetCurrentfloodCheckState: () => set({ currentfloodCheckState: null }),
}));

export default useStore;
