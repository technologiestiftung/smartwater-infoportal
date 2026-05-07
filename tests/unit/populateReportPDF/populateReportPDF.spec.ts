import { describe, it } from "node:test";
import { reportCases } from "../../e2e/report/all-report.cases";
import { populatePDFKeysWithFloodRiskAnswers } from "@/components/Report/utils";

describe("populateReportPDF", () => {
	for (const c of reportCases) {
		it(c.query, async () => {
			const pdfKeys = populatePDFKeysWithFloodRiskAnswers(
				c.skip ? null : c.answers,
				c.skip ? "true" : null,
				c.hazardEntities ?? null,
				(key) => key,
			);
			console.log("run query", c.query, pdfKeys);
		});
	}
});
