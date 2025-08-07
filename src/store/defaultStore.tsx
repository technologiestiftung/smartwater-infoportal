import { create } from "zustand";
import {
	AddressResult,
	FloodRiskAnswers,
	FloodRiskResult,
	LocationData,
} from "@/lib/types";
import { devtools } from "zustand/middleware";

type StoreState = {
	currentUserAddress: AddressResult | null;
	currentfloodCheckState: string | null;
	floodRiskAnswers: FloodRiskAnswers;
	floodRiskResult: FloodRiskResult | null;
	locationData: LocationData | null;
	isLoadingLocationData: boolean;

	setCurrentUserAddress: (address: AddressResult) => void;
	resetCurrentUserAddress: () => void;
	setFloodRiskAnswers: (answers: FloodRiskAnswers) => void;
	updateFloodRiskAnswer: (
		questionId: string,
		answer: string | string[] | number,
	) => void;
	setFloodRiskResult: (result: FloodRiskResult) => void;
	resetFloodRiskData: () => void;
	setLocationData: (data: LocationData) => void;
	resetLocationData: () => void;
	setLoadingLocationData: (loading: boolean) => void;
};

const useStore = create<StoreState>()(
	devtools(
		(set) => ({
			currentUserAddress: null,
			currentfloodCheckState: null,
			floodRiskAnswers: {},
			floodRiskResult: null,

			locationData: null,
			isLoadingLocationData: false,
			setCurrentUserAddress: (address: AddressResult) =>
				set({ currentUserAddress: address }),
			resetCurrentUserAddress: () => set({ currentUserAddress: null }),
			setFloodRiskAnswers: (answers: FloodRiskAnswers) =>
				set({ floodRiskAnswers: answers }),
			updateFloodRiskAnswer: (
				questionId: string,
				answer: string | string[] | number,
			) =>
				set((state) => ({
					floodRiskAnswers: {
						...state.floodRiskAnswers,
						[questionId]: answer,
					},
				})),
			setFloodRiskResult: (result: FloodRiskResult) =>
				set({ floodRiskResult: result }),
			resetFloodRiskData: () =>
				set({ floodRiskAnswers: {}, floodRiskResult: null }),
			setLocationData: (data) => set({ locationData: data }),
			resetLocationData: () => set({ locationData: null }),
			setLoadingLocationData: (loading) =>
				set({ isLoadingLocationData: loading }),
		}),
		{
			name: "flood-risk-store",
		},
	),
);

export default useStore;
