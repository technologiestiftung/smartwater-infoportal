import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "gdi.berlin.de",
			},
		],
	},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
	...nextConfig,
});
