import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import technologiestiftung from "@technologiestiftung/eslint-config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	// first ensure this rule always gets its options
	{
		rules: {
			"@typescript-eslint/no-unused-expressions": [
				"error",
				{
					allowShortCircuit: true,
					allowTernary: false,
					allowTaggedTemplates: false,
				},
			],
		},
	},

	...technologiestiftung,
	...compat.extends("next/core-web-vitals"),
	{
		files: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.test.tsx", "**/tests/**/*.ts"],
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
