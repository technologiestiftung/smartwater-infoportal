/* eslint-disable */

import { Button } from "berlin-ui-library";
import { useEffect, useState } from "react";

type EvalRow = {
	totalScore: number;
	counter: number;
	evaluation: number | null;
};

const questions = [
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: -1,
			x: 1,
		},
		{
			s: 2,
			x: 1,
		},
		{
			s: 0,
			x: 0,
			skip: true,
		},
	],
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: -1,
			x: 1,
		},
		{
			s: 0,
			x: 0,
		},
	],
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: -1,
			x: 1,
		},
		{
			s: 1,
			x: 1,
		},
		{
			s: 2,
			x: 1,
		},
		{
			s: 0,
			x: 0,
		},
	],
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: 2,
			x: 1,
		},
		{
			s: 0,
			x: 0,
		},
	],
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: 2,
			x: 1,
		},
		{
			s: 0,
			x: 0,
		},
	],
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: 2,
			x: 1,
		},
	],
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: -2,
			x: 1,
		},
		{
			s: -1,
			x: 1,
		},
		{
			s: 1,
			x: 1,
		},
	],
	[
		{
			s: -2,
			x: 1,
		},
		{
			s: -2,
			x: 1,
		},
		{
			s: -1,
			x: 1,
		},
		{
			s: 1,
			x: 1,
		},
	],
];

export default function EvaluationTesting() {
	const [rows, setRows] = useState<EvalRow[]>([]);

	// ➊ sort state
	const [sort, setSort] = useState<{
		key: "totalScore" | "counter" | "evaluation";
		dir: "asc" | "desc";
	}>({
		key: "evaluation",
		dir: "asc",
	});

	// ➋ sorter
	function sortRows(data: EvalRow[], s = sort) {
		const { key, dir } = s;
		const m = dir === "asc" ? 1 : -1;
		return [...data].sort((a, b) => {
			let va = a[key] as number | null;
			let vb = b[key] as number | null;

			// push null evaluations last
			if (key === "evaluation") {
				if (va == null && vb == null) return 0;
				if (va == null) return 1;
				if (vb == null) return -1;
			}

			return ((va as number) - (vb as number)) * m;
		});
	}

	// ➌ header click -> toggle / set sort
	function toggleSort(key: "totalScore" | "counter" | "evaluation") {
		setSort((s) =>
			s.key === key
				? { key, dir: s.dir === "asc" ? "desc" : "asc" }
				: { key, dir: "asc" },
		);
	}

	// ➍ recompute order when sort changes
	useEffect(() => {
		if (rows.length) setRows((prev) => sortRows(prev));
	}, [sort]);

	function runEvaluationSimulation() {
		if (rows.length) return setRows([]);

		const results = new Set<string>();

		function explore(qIndex = 0, totalScore = 0, counter = 0) {
			if (qIndex >= questions.length) {
				results.add(`${totalScore}|${counter}`);
				return;
			}
			const answers = questions[qIndex];
			if (!Array.isArray(answers) || answers.length === 0) {
				explore(qIndex + 1, totalScore, counter);
				return;
			}
			for (const ans of answers) {
				const newScore = totalScore + ans.s;
				const newCounter = counter + ans.x;
				const nextIndex = ans.skip ? qIndex + 2 : qIndex + 1;
				explore(nextIndex, newScore, newCounter);
			}
		}

		explore();

		const setInnerRows: EvalRow[] = [...results].map((key) => {
			const [s, x] = key.split("|").map(Number);
			return { totalScore: s, counter: x, evaluation: x === 0 ? null : s / x };
		});

		// use current sort
		setRows(sortRows(setInnerRows));
	}

	return (
		<>
			<Button onClick={runEvaluationSimulation}>
				Alle Gefährdungsbewertungs-Möglichkeiten anzeigen
			</Button>
			<div className="space-y-4">
				{rows.length > 0 && <h3>Möglichkeiten insgesamt: {rows.length}</h3>}
				{rows.length > 0 && (
					<div className="overflow-x-auto">
						<table className="min-w-max table-auto text-left text-sm">
							<thead>
								<tr className="border-b">
									<th className="select-none px-3 py-2 font-semibold">#</th>
									<th
										className="cursor-pointer select-none px-3 py-2 font-semibold"
										onClick={() => toggleSort("totalScore")}
									>
										SUMME-Punkte:{" "}
										{sort.key === "totalScore"
											? sort.dir === "asc"
												? "▲"
												: "▼"
											: ""}
									</th>
									<th
										className="cursor-pointer select-none px-3 py-2 font-semibold"
										onClick={() => toggleSort("counter")}
									>
										Counter X:{" "}
										{sort.key === "counter"
											? sort.dir === "asc"
												? "▲"
												: "▼"
											: ""}
									</th>
									<th
										className="cursor-pointer select-none px-3 py-2 font-semibold"
										onClick={() => toggleSort("evaluation")}
									>
										Bewertung Gefährdung (SUMME-Punkte/X):{" "}
										{sort.key === "evaluation"
											? sort.dir === "asc"
												? "▲"
												: "▼"
											: ""}
									</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((r, i) => (
									<tr
										key={`${r.totalScore}|${r.counter}`}
										className="border-b last:border-0"
									>
										<td className="px-3 py-2">{i + 1}</td>
										<td className="px-3 py-2">{r.totalScore}</td>
										<td className="px-3 py-2">{r.counter}</td>
										<td className="px-3 py-2">
											{r.evaluation === null ? "—" : r.evaluation.toFixed(4)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</>
	);
}
