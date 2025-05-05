import { create } from "zustand";

const useStore = create((set) => ({
	currentUserAddress: null,
	currentEvaluationState: null,
	setCurrentUserAddress: (address: string) =>
		set({ currentUserAddress: address }),
	resetCurrentUserAddress: () => set({ currentUserAddress: null }),
	setCurrentEvaluationState: (state: string) =>
		set({ currentEvaluationState: state }),
	resetCurrentEvaluationState: () => set({ currentEvaluationState: null }),
}));

export default useStore;
