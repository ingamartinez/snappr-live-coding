import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Lean type-aware setup for the monorepo. `projectService` auto-discovers each
// package's tsconfig, so the type-aware rules below work across shared/, server/, client/.
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/drizzle/**",
      "**/*.config.*",
      "**/coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript already catches undefined references; the lint rule only adds
      // browser/node globals noise.
      "no-undef": "off",
      // The rule that justifies this whole linter: a missing `await` on an async
      // Express handler is invisible to tsc and to most tests, then 500s in prod.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
