// store/defaultStore.tsx
import { create } from "zustand";
import {
	AddressResult,
	FloodRiskAnswers,
	FloodRiskResult,
	LocationData,
} from "@/lib/types";
import { devtools, persist } from "zustand/middleware";
import {
	prePopulateFromLocationData,
	calculateFloodRiskScore,
	getNextWorkflowStep,
	getWorkflowRoute,
	calculateQuestionScore,
} from "@/utils/floodRiskCalculator";
import riskConfig from "@/config/floodRiskConfig.json";
import { getHazardEntities, HazardEntity } from "@/utils/storeUtils";

type StoreState = {
	// Core data
	currentUserAddress: AddressResult | null;
	locationData: LocationData | null;
	floodRiskAnswers: FloodRiskAnswers;
	floodRiskResult: FloodRiskResult | null;
	isLoadingLocationData: boolean;
	activeMapFilter: "heavyRain" | "fluvialFlood";
	fullScreenMap: boolean;
	isLayerTreeOpen: boolean;
	isLegendeOpen: boolean;
	errorLayers: string[];

	// Actions
	setCurrentUserAddress: (address: AddressResult) => void;
	resetCurrentUserAddress: () => void;
	setLocationData: (data: LocationData) => void;
	resetLocationData: () => void;
	setLoadingLocationData: (loading: boolean) => void;
	updateActiveMapFilter: (filter: string) => void;
	updateFullScreenMap: (fullScreen: boolean) => void;
	updateLayerTreeIsOpen: (open: boolean) => void;
	updateLegendeIsOpen: (open: boolean) => void;
	updateErrorLayers: (layers: string[]) => void;
	updateFloodRiskAnswer: (
		questionId: string,
		answer: string | string[] | number,
	) => void;
	calculateAndSetResult: () => void;
	resetAll: () => void;
	getNextStep: (currentPath: string) => string;

	// Selectors
	getHazardEntities: () => HazardEntity[] | null;
};

const useStore = create<StoreState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				currentUserAddress: null,
				locationData: null,
				floodRiskAnswers: {},
				floodRiskResult: null,
				isLoadingLocationData: false,
				activeMapFilter: "heavyRain",
				fullScreenMap: false,
				isLayerTreeOpen: false,
				isLegendeOpen: true,
				errorLayers: [],

				setCurrentUserAddress: (address: AddressResult) =>
					set({ currentUserAddress: address }),
				resetCurrentUserAddress: () => set({ currentUserAddress: null }),

				setLocationData: (data) =>
					set((state) => ({
						locationData: data,
						floodRiskAnswers: {
							...state.floodRiskAnswers,
							...prePopulateFromLocationData(data),
						},
					})),
				resetLocationData: () => set({ locationData: null }),
				setLoadingLocationData: (loading) =>
					set({ isLoadingLocationData: loading }),

				updateActiveMapFilter: (filter) =>
					set({ activeMapFilter: filter as "heavyRain" | "fluvialFlood" }),

				updateFullScreenMap: (fullScreen: boolean) =>
					set({ fullScreenMap: fullScreen }),

				updateLayerTreeIsOpen: (open: boolean) =>
					set({ isLayerTreeOpen: open }),

				updateErrorLayers: (layers: string[]) => set({ errorLayers: layers }),

				updateLegendeIsOpen: (open: boolean) => set({ isLegendeOpen: open }),

				updateFloodRiskAnswer: (
					questionId: string,
					answer: string | string[] | number,
				) =>
					set((state) => {
						const questionConfig = riskConfig.questions.find(
							(q) => q.id === questionId,
						);
						return {
							floodRiskAnswers: {
								...state.floodRiskAnswers,
								[questionId]: {
									value: answer,
									score: calculateQuestionScore(questionId, answer),
									weight: questionConfig?.weight || 1,
								},
							},
						};
					}),

				calculateAndSetResult: () => {
					const state = get();
					const result = calculateFloodRiskScore(state.floodRiskAnswers);
					set({ floodRiskResult: result });
				},

				getNextStep: (currentPath: string) => {
					const state = get();
					const nextStep = getNextWorkflowStep(
						state.locationData,
						state.floodRiskAnswers,
						currentPath,
					);
					return getWorkflowRoute(nextStep);
				},

				resetAll: () =>
					set({
						currentUserAddress: null,
						locationData: null,
						floodRiskAnswers: {},
						floodRiskResult: null,
						isLoadingLocationData: false,
					}),

				// Selectors
				getHazardEntities: (): HazardEntity[] | null => {
					const state = get();
					return getHazardEntities(state.locationData);
				},
			}),
			{
				name: "flood-risk-store",
			},
		),
		{
			name: "flood-risk-store-devtools",
		},
	),
);

export default useStore;
