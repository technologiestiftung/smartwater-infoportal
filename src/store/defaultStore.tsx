// store/defaultStore.tsx
import { create } from "zustand";
import { FloodRiskAnswers, FloodRiskResult, LocationData } from "@/lib/types";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import {
	prePopulateFromLocationData,
	calculateFloodRiskScore,
	calculateQuestionScore,
} from "@/utils/floodRiskCalculator";
import { getHazardEntities, HazardEntity } from "@/utils/storeUtils";
import { LocationDataNotFound } from "@/lib/geoserverClient";

type StoreState = {
	// Core data
	locationData: LocationData;
	floodRiskAnswers: FloodRiskAnswers;
	floodRiskResult: FloodRiskResult | null;
	interactiveMap: {
		activeMapFilter: "heavyRain" | "fluvialFlood";
		fullScreenMap: boolean;
		isLayerTreeOpen: boolean;
		isLegendeOpen: boolean;
		errorLayers: string[];
	};

	// state hydration
	hasHydrated: boolean;
	setHasHydrated: (state: boolean) => void;

	// Actions
	setLocationData: (data: LocationData) => void;
	resetLocationData: () => void;
	updateFloodRiskAnswer: (
		questionId: string,
		answer: string | string[] | number,
	) => void;
	removeFloodRiskAnswer: (questionId: string) => void;
	calculateAndSetResult: () => void;
	resetAll: () => void;
	updateInteractiveMap: (data: Partial<StoreState["interactiveMap"]>) => void;

	// Selectors
	getHazardEntities: () => HazardEntity[] | null;
};

const useStore = create<StoreState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				locationData: LocationDataNotFound,
				floodRiskAnswers: {},
				floodRiskResult: null,
				interactiveMap: {
					activeMapFilter: "heavyRain",
					fullScreenMap: false,
					isLayerTreeOpen: false,
					isLegendeOpen: true,
					errorLayers: [],
				},

				// state hydration
				hasHydrated: false,
				setHasHydrated: (state) => set({ hasHydrated: state }),

				setLocationData: (data) =>
					set((state) => ({
						locationData: data,
						floodRiskAnswers: {
							...state.floodRiskAnswers,
							...prePopulateFromLocationData(data),
						},
					})),
				resetLocationData: () => set({ locationData: LocationDataNotFound }),

				updateInteractiveMap: (data) =>
					set((state) => ({
						interactiveMap: {
							...state.interactiveMap,
							...data,
						},
					})),

				updateFloodRiskAnswer: (
					questionId: string,
					answer: string | string[] | number,
				) =>
					set((state) => {
						const getCalc = calculateQuestionScore(questionId, answer);
						return {
							floodRiskAnswers: {
								...state.floodRiskAnswers,
								[questionId]: {
									value: answer,
									score: getCalc.score,
									addToCounter: getCalc.addToCounter,
								},
							},
						};
					}),

				removeFloodRiskAnswer: (questionId: string) =>
					set((state) => {
						const { [questionId]: _removed, ...rest } = state.floodRiskAnswers;
						return {
							floodRiskAnswers: rest,
						};
					}),

				calculateAndSetResult: () => {
					const state = get();
					const result = calculateFloodRiskScore(state.floodRiskAnswers);
					set({ floodRiskResult: result });
				},

				resetAll: () =>
					set({
						locationData: LocationDataNotFound,
						floodRiskAnswers: {},
						floodRiskResult: null,
						interactiveMap: {
							activeMapFilter: "heavyRain",
							fullScreenMap: false,
							isLayerTreeOpen: false,
							isLegendeOpen: true,
							errorLayers: [],
						},
					}),

				// Selectors
				getHazardEntities: (): HazardEntity[] | null => {
					const state = get();
					return getHazardEntities(state.locationData);
				},
			}),
			{
				name: "flood-risk-store",
				storage: createJSONStorage(() => sessionStorage),
				onRehydrateStorage: () => (state) => {
					state?.setHasHydrated(true);
				},
			},
		),
		{
			name: "flood-risk-store-devtools",
		},
	),
);

export default useStore;
