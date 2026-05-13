import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    ignores: ["src/generated/prisma/**/*"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
    },
  },
  // Rule 1: Enforce runManagedTransaction over raw prisma.$transaction.
  // Scoped to module and app code only, excluding the one file allowed to call it directly.
  {
    files: ["src/modules/**/*.ts", "src/app/**/*.ts"],
    ignores: ["src/lib/managedTransaction.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='$transaction']",
          message:
            "Direct prisma.$transaction() is banned. Use runManagedTransaction() from @/lib/managed-transaction to ensure statement_timeout, lock_timeout, and idle_in_transaction_session_timeout guards are always active.",
        },
      ],
    },
  },
  // Rule 2: Ban .Result property access anywhere in src.
  // Prevents the sync-over-async pattern that blocks the event loop
  // and prevents AbortSignal listeners from ever firing.
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          property: "Result",
          message:
            ".Result is banned. This pattern blocks the Node.js event loop and prevents AbortSignal from firing, causing deadlocks under load. Use await instead.",
        },
      ],
    },
  },
]);

export default eslintConfig;
