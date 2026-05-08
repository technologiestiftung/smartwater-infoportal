import { HazardEntity } from "@/utils/storeUtils";

const address = "Grunewaldstraße 61-62";

const options = {
	q0: ["rent", "Owner"],
	q1: ["yesWithWindow", "yesWithoutWindow", "no", "noInformation"],
	q2: ["highValue", "lowValue", "noInformation"],
	q3: ["no", "yesUnknown", "yesGood", "noInformation"],
	q4: ["bad", "good", "noInformation"],
	q5: ["yes", "no", "noInformation"],
} as const;

const hazardEntities: HazardEntity[] = [
	{
		name: "heavyRain",
		hazardLevel: "none",
	},
	{
		name: "fluvialFlood",
		hazardLevel: "none",
		showSubLabel: true,
		subHazardLevel: "no",
	},
];

type QuestionAnswer<T extends string> = {
	value: T;
	score: number;
	addToCounter: number;
};

const answer = <T extends string>(value: T): QuestionAnswer<T> => ({
	value,
	score: 0,
	addToCounter: 0,
});

type Q0 = (typeof options.q0)[number];
type Q1 = (typeof options.q1)[number];
type Q2 = (typeof options.q2)[number];
type Q3 = (typeof options.q3)[number];
type Q4 = (typeof options.q4)[number];
type Q5 = (typeof options.q5)[number];

type Case =
	| {
			query: string;
			address: string;
			hazardEntities?: HazardEntity[] | null;
			skip: true;
			answers: null;
	  }
	| {
			query: string;
			address: string;
			hazardEntities?: HazardEntity[] | null;
			skip?: false;
			answers: {
				q0: QuestionAnswer<Q0>;
				q1: QuestionAnswer<"no" | "noInformation">;
				q3: QuestionAnswer<Q3>;
				q4: QuestionAnswer<Q4>;
				q5: QuestionAnswer<Q5>;
			};
	  }
	| {
			query: string;
			address: string;
			hazardEntities?: HazardEntity[] | null;
			skip?: false;
			answers: {
				q0: QuestionAnswer<Q0>;
				q1: QuestionAnswer<"yesWithWindow" | "yesWithoutWindow">;
				q2: QuestionAnswer<Q2>;
				q3: QuestionAnswer<Q3>;
				q4: QuestionAnswer<Q4>;
				q5: QuestionAnswer<Q5>;
			};
	  };

export const reportCases: Case[] = [
	{
		query: "skip-case",
		address,
		hazardEntities,
		skip: true,
		answers: null,
	},

	...options.q0.flatMap((q0): Case[] =>
		options.q1.flatMap((q1): Case[] => {
			if (q1 === "no" || q1 === "noInformation") {
				return options.q3.flatMap((q3): Case[] =>
					options.q4.flatMap((q4): Case[] =>
						options.q5.map(
							(q5): Case => ({
								query: `${q0}-${q1}-${q3}-${q4}-${q5}`,
								address,
								hazardEntities,
								answers: {
									q0: answer(q0),
									q1: answer(q1),
									q3: answer(q3),
									q4: answer(q4),
									q5: answer(q5),
								},
							}),
						),
					),
				);
			}

			return options.q2.flatMap((q2): Case[] =>
				options.q3.flatMap((q3): Case[] =>
					options.q4.flatMap((q4): Case[] =>
						options.q5.map(
							(q5): Case => ({
								query: `${q0}-${q1}-${q2}-${q3}-${q4}-${q5}`,
								address,
								hazardEntities,
								answers: {
									q0: answer(q0),
									q1: answer(q1),
									q2: answer(q2),
									q3: answer(q3),
									q4: answer(q4),
									q5: answer(q5),
								},
							}),
						),
					),
				),
			);
		}),
	),
];
