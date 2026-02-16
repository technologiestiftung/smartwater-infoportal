import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import { technologiestiftungRules } from "./eslintRules.mjs";

const eslintConfig = [
	{
		ignores: [
			"node_modules/**",
			".next/**",
			"out/**",
			"build/**",
			"next-env.d.ts",
			"src/components/Report/assets/arial-*.js"
		],
	},
	...nextCoreWebVitals,
	technologiestiftungRules,
	{
		files: [
			"**/__tests__/**/*.ts",
			"**/*.test.ts",
			"**/*.test.tsx",
			"**/tests/**/*.ts",
		],
		languageOptions: {
			globals: {
				jest: "readonly",
				describe: "readonly",
				it: "readonly",
				expect: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
				beforeAll: "readonly",
				afterAll: "readonly",
			},
		},
	},
];

export default eslintConfig;
