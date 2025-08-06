/** @type {import('jest').Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/tests", "<rootDir>/src"],
	testMatch: [
		"**/__tests__/**/*.+(ts|tsx|js)",
		"**/*.(test|spec).+(ts|tsx|js)",
	],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	verbose: true,
};
