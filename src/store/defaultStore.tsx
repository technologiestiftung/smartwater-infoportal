import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface FloodRiskAnswers {
	q1?: string;
	q2?: string[];
	q3?: string;
	q4?: string;
	q5?: string;
	q6?: string;
	qA?: string;
	qB?: number;
	qC?: number;
}

export interface FloodRiskResult {
	score: number;
	riskLevel: "low" | "moderate" | "high" | "insufficient-data";
	message: string;
}

interface StoreState {
	currentUserAddress: string | null;
	currentfloodCheckState: string | null;
	floodRiskAnswers: FloodRiskAnswers;
	floodRiskResult: FloodRiskResult | null;
	setCurrentUserAddress: (address: string) => void;
	resetCurrentUserAddress: () => void;
	setCurrentfloodCheckState: (state: string) => void;
	resetCurrentfloodCheckState: () => void;
	setFloodRiskAnswers: (answers: FloodRiskAnswers) => void;
	updateFloodRiskAnswer: (
		questionId: string,
		answer: string | string[] | number,
	) => void;
	setFloodRiskResult: (result: FloodRiskResult) => void;
	resetFloodRiskData: () => void;
}

const useStore = create<StoreState>()(
	devtools(
		(set) => ({
			currentUserAddress: null,
			currentfloodCheckState: null,
			floodRiskAnswers: {},
			floodRiskResult: null,
			setCurrentUserAddress: (address: string) =>
				set({ currentUserAddress: address }),
			resetCurrentUserAddress: () => set({ currentUserAddress: null }),
			setCurrentfloodCheckState: (state: string) =>
				set({ currentfloodCheckState: state }),
			resetCurrentfloodCheckState: () => set({ currentfloodCheckState: null }),
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
		}),
		{
			name: "flood-risk-store",
		},
	),
);

export default useStore;
