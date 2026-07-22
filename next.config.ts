import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const berlinInfoScriptOrigin = "https://www.berlin.de";
const mapDataOrigins = [
	"https://sgx.geodatenzentrum.de",
	"https://gdi.berlin.de",
	"https://geoserver.ionos-main.ds-apps.tsb-berlin.de",
].join(" ");
const mappOrigin = "https://w7.berlin.de";
const matomoOrigin = process.env.NEXT_PUBLIC_MATOMO_URL
	? new URL(process.env.NEXT_PUBLIC_MATOMO_URL).origin
	: undefined;
const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'self'",
	"frame-src 'self' blob:",
	"form-action 'self'",
	`img-src 'self' data: blob: ${berlinInfoScriptOrigin} ${mappOrigin} ${mapDataOrigins}${matomoOrigin ? ` ${matomoOrigin}` : ""}`,
	`font-src 'self' data: ${berlinInfoScriptOrigin}`,
	`style-src 'self' 'unsafe-inline' ${berlinInfoScriptOrigin}`,
	`script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} ${berlinInfoScriptOrigin} ${mappOrigin}${matomoOrigin ? ` ${matomoOrigin}` : ""}`,
	`connect-src 'self' ${mappOrigin} ${mapDataOrigins}${matomoOrigin ? ` ${matomoOrigin}` : ""}`,
	"upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "gdi.berlin.de",
			},
		],
	},

	outputFileTracingIncludes: {
		"/**/*": ["node_modules/@sparticuz/chromium/bin/**"],
	},

	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Content-Security-Policy",
						value: contentSecurityPolicy,
					},
				],
			},
		];
	},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
	...nextConfig,
});
