import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
	// Provide a static locale, fetch a user setting,
	// read from `cookies()`, `headers()`, etc.
	const locale = "de";

	const messages = {
		...(await import(`../../messages/${locale}/home.json`)).default,
		...(await import(`../../messages/${locale}/common.json`)).default,
		...(await import(`../../messages/${locale}/checkResults.json`)).default,
		...(await import(`../../messages/${locale}/evaluation.json`)).default,
		...(await import(`../../messages/${locale}/generalInfo.json`)).default,
		...(await import(`../../messages/${locale}/questionnaire.json`)).default,
		...(await import(`../../messages/${locale}/recommendations.json`)).default,
	};

	return {
		locale,
		messages,
	};
});
