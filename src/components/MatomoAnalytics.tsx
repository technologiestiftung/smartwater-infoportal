"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

export default function MatomoAnalytics() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// useEffect(() => {
	// 	if (!MATOMO_URL || !MATOMO_SITE_ID) return;

	// 	(window as any)._paq = (window as any)._paq || [];
	// 	(window as any)._paq.push(["disableCookies"]);

	// 	trackAppRouter({
	// 		url: MATOMO_URL,
	// 		siteId: MATOMO_SITE_ID,
	// 		pathname,
	// 		searchParams,
	// 		disableCookies: true,
	// 	});
	// }, [pathname, searchParams]);

	useEffect(() => {
		if (!MATOMO_URL || !MATOMO_SITE_ID) return;

		const _paq = (window as any)._paq || [];
		(window as any)._paq = _paq;
		_paq.push(["disableCookies"]);
		_paq.push(["setTrackerUrl", `${MATOMO_URL}/matomo.php`]);
		_paq.push(["setSiteId", MATOMO_SITE_ID]);
		_paq.push(["trackPageView"]);
	}, []);

	useEffect(() => {
		if (!MATOMO_URL || !MATOMO_SITE_ID) return;
		const _paq = (window as any)._paq || [];
		_paq.push(["setCustomUrl", pathname]);
		_paq.push(["trackPageView"]);
	}, [pathname, searchParams]);

	return null;
}
