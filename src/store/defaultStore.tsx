// store/defaultStore.tsx
import { create } from "zustand";
import {
	CurrentUserAddress,
	FloodRiskAnswers,
	FloodRiskResult,
	LocationData,
} from "@/lib/types";
import { devtools, persist } from "zustand/middleware";
import {
	prePopulateFromLocationData,
	calculateFloodRiskScore,
	calculateQuestionScore,
} from "@/utils/floodRiskCalculator";
import { getHazardEntities, HazardEntity } from "@/utils/storeUtils";
import { PDFKeys } from "@/components/Report/types";

type TestingFeatureNames =
	| "resetAllButtonOnHomepage"
	| "addressSearchDetails"
	| "locationButton"
	| "mapsOnResultPage"
	| "evaluationTesting"
	| "riskWidgetDetails"
	| "showWidgetsBelowPDF"
	| "newPDFButton";

type StoreState = {
	// Core data
	currentUserAddress: CurrentUserAddress | null;
	locationData: LocationData | null;
	floodRiskAnswers: FloodRiskAnswers;
	floodRiskResult: FloodRiskResult | null;
	activeMapFilter: "heavyRain" | "fluvialFlood";
	fullScreenMap: boolean;
	isLayerTreeOpen: boolean;
	isLegendeOpen: boolean;
	errorLayers: string[];
	showTestingFeatures: TestingFeatureNames[];

	// Actions
	setCurrentUserAddress: (currentUserAddress: CurrentUserAddress) => void;
	resetCurrentUserAddress: () => void;
	setLocationData: (data: LocationData) => void;
	resetLocationData: () => void;
	updateActiveMapFilter: (filter: string) => void;
	updateFullScreenMap: (fullScreen: boolean) => void;
	updateLayerTreeIsOpen: (open: boolean) => void;
	updateLegendeIsOpen: (open: boolean) => void;
	updateErrorLayers: (layers: string[]) => void;
	updateFloodRiskAnswer: (
		questionId: string,
		answer: string | string[] | number,
	) => void;
	removeFloodRiskAnswer: (questionId: string) => void;
	calculateAndSetResult: () => void;
	resetAll: () => void;

	// Selectors
	getHazardEntities: () => HazardEntity[] | null;
};

const currentFeatures: TestingFeatureNames[] = [
	"evaluationTesting",
	"riskWidgetDetails",
	"resetAllButtonOnHomepage",
	"mapsOnResultPage",
];

const useStore = create<StoreState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				currentUserAddress: null,
				locationData: null,
				floodRiskAnswers: {},
				floodRiskResult: null,
				activeMapFilter: "heavyRain",
				fullScreenMap: false,
				isLayerTreeOpen: false,
				isLegendeOpen: true,
				errorLayers: [],
				showTestingFeatures: currentFeatures,
				pdfError: null,

				setCurrentUserAddress: (currentUserAddress: CurrentUserAddress) =>
					set({ currentUserAddress: currentUserAddress }),
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
						currentUserAddress: null,
						locationData: null,
						floodRiskAnswers: {},
						floodRiskResult: null,
						errorLayers: [],
						showTestingFeatures: currentFeatures,
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
