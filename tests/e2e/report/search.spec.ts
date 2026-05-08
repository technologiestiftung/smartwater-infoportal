import { test, expect, type Page } from "@playwright/test";
import { reportCases } from "./all-report.cases";

const BASE_URL = "http://localhost:3000";
const DEFAULT_TIMEOUT = 20_000;

async function searchAddress(page: Page, address: string) {
	await page.goto(BASE_URL);

	const input = page.locator('input[type="text"]');
	await expect(input).toBeVisible();
	await input.fill(address);

	const resultsList = page.locator("ul#results-list");
	await expect(resultsList).toBeVisible({ timeout: DEFAULT_TIMEOUT });

	const firstResultButton = resultsList.locator("button").first();
	await expect(firstResultButton).toBeVisible();
	await firstResultButton.click();

	const submitButton = page.locator('button[type="submit"]');
	await expect(submitButton).toBeVisible();
	await submitButton.click();
}

async function startQuestionnaire(page: Page, skip: boolean) {
	const radioGroup = page.locator("div[role='radiogroup']");
	await expect(radioGroup).toBeVisible({ timeout: DEFAULT_TIMEOUT });

	if (skip) {
		await radioGroup.locator("label").last().click();
	} else {
		await radioGroup.locator("label").first().click();
	}

	const submitQuestionnaireButton = page.locator(
		"#questionnaire-submit-button",
	);
	await expect(submitQuestionnaireButton).toBeVisible();
	await submitQuestionnaireButton.click();
}

async function answerQuestionnaire(
	page: Page,
	answers: Record<string, { value: string | number }>,
) {
	await expect(page.locator("div[role='radiogroup']")).toBeVisible({
		timeout: DEFAULT_TIMEOUT,
	});

	for (const answer of Object.values(answers)) {
		const radio = page.locator(
			`button[role="radio"][value="${answer.value === "Owner" ? "flatOwner" : answer.value}"]`,
		);
		await expect(radio).toBeVisible({ timeout: DEFAULT_TIMEOUT });
		await radio.click();

		const nextButton = page.locator("#next-question-button");
		await expect(nextButton).toBeVisible();
		await nextButton.click();
	}
}

async function downloadPdf(page: Page) {
	const container = page.locator("#pdf-ready");
	await expect(container).toBeVisible({ timeout: 100_000 });

	await container.locator("button").first().click();
}

async function openPdf(page: Page, query: string) {
	const readyBtn = page.locator("#pdf-ready button").first();
	await readyBtn.isVisible();
	await readyBtn.click();
	const [download] = await Promise.all([
		page.waitForEvent("download"),
		page.locator("#pdf-ready button").first().click(),
	]);
	const path = `tests/e2e/downloads/${query}-${Date.now()}.pdf`;

	await download.saveAs(path);
	expect(download.suggestedFilename()).toMatch(/\.pdf$/);
}

const downloadThePDF = true;

test.describe("Create report", () => {
	for (const c of reportCases) {
		test(`creates report for "${c.query}"`, async ({ page }) => {
			test.setTimeout(720_000);
			await searchAddress(page, c.address);
			await startQuestionnaire(page, !!c.skip);
			if (!c.skip) {
				await answerQuestionnaire(page, c.answers);
			}
			if (downloadThePDF) {
				await downloadPdf(page);
				await openPdf(page, c.query);
			} else {
				const container = page.locator("#report-pdf-wrapper");
				await expect(container).toBeVisible();
			}
		});
	}
});
