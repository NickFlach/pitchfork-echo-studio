import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore build artifacts, compiled output, and hardhat scripts
  { ignores: ["dist", "artifacts", "cache", "deployments", "scripts/*.ts", "scripts/*.cjs"] },

  // Frontend React/TypeScript files
  // Note: Relaxed rules for existing codebase patterns.
  // Future refactoring should introduce stricter typing gradually.
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow conditional hooks for complex component patterns (existing codebase usage)
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Allow existing patterns
      "prefer-const": "warn",
      "no-shadow-restricted-names": "warn",
      "no-constant-binary-expression": "warn",
      "no-constant-condition": "warn",
    },
  },

  // Server-side TypeScript files - relaxed typing for AI/ML engines
  // These files use dynamic data structures where explicit 'any' is practical
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["server/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
