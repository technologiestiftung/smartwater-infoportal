import { test, expect, type Page } from "@playwright/test";
import { reportCases } from "./report.cases";

const BASE_URL = "http://localhost:3000";
const DEFAULT_TIMEOUT = 20_000;

async function searchAddress(page: Page, query: string) {
	await page.goto(BASE_URL);

	const input = page.locator('input[type="text"]');
	await expect(input).toBeVisible();
	await input.fill(query);

	const resultsList = page.locator("ul#results-list");
	await expect(resultsList).toBeVisible({ timeout: DEFAULT_TIMEOUT });

	const firstResultButton = resultsList.locator("button").first();
	await expect(firstResultButton).toBeVisible();
	await firstResultButton.click();

	const submitButton = page.locator('button[type="submit"]');
	await expect(submitButton).toBeVisible();
	await submitButton.click();
}

async function startQuestionnaire(page: Page) {
	const radioGroup = page.locator("div[role='radiogroup']");
	await expect(radioGroup).toBeVisible({ timeout: DEFAULT_TIMEOUT });

	await radioGroup.locator("label").first().click();

	const submitQuestionnaireButton = page.locator(
		"#questionnaire-submit-button",
	);
	await expect(submitQuestionnaireButton).toBeVisible();
	await submitQuestionnaireButton.click();
}

async function answerQuestionnaire(
	page: Page,
	answers: Record<string, string | number>,
) {
	await expect(page.locator("div[role='radiogroup']")).toBeVisible({
		timeout: DEFAULT_TIMEOUT,
	});

	for (const answerValue of Object.values(answers)) {
		const radio = page.locator(`button[role="radio"][value="${answerValue}"]`);
		await expect(radio).toBeVisible({ timeout: DEFAULT_TIMEOUT });
		await radio.click();

		const nextButton = page.locator("#next-question-button");
		await expect(nextButton).toBeVisible();
		await nextButton.click();
	}
}

async function downloadPdf(page: Page) {
	const container = page.locator("#pdf-ready");
	await expect(container).toBeVisible({ timeout: 360_000 });

	await container.locator("button").first().click();
}

async function openPdf(page: Page) {
	const readyBtn = page.locator("#pdf-ready button").first();
	await readyBtn.isVisible();
	await readyBtn.click();
	const [download] = await Promise.all([
		page.waitForEvent("download"),
		page.locator("#pdf-ready button").first().click(),
	]);
	const path = "tests/e2e/downloads/report.pdf";

	await download.saveAs(path);
	expect(download.suggestedFilename()).toMatch(/\.pdf$/);
}

test.describe("Create report", () => {
	for (const c of reportCases) {
		test(`creates report for "${c.query}"`, async ({ page }) => {
			await searchAddress(page, c.query);
			await startQuestionnaire(page);
			await answerQuestionnaire(page, c.answers);
			await downloadPdf(page);
			await openPdf(page);
		});
	}
});
