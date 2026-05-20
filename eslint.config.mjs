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
  // Rule 1a: $transaction ban for the notifications module only.
  // (Rule 1b below applies $transaction + emailJob bans to the rest of modules+app.)
  // Flat-config note: no-restricted-syntax options are replaced (not merged) when
  // multiple configs match a file, so we must keep every banned pattern relevant
  // to a file inside a single config that matches it.
  {
    files: ["src/modules/notifications/**/*.ts"],
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
  // Rule 1b: $transaction ban + EmailJob-bypass ban for all module/app code
  // outside the notifications module (which legitimately writes to EmailJob).
  // managedTransaction.ts is the one file allowed to call $transaction directly.
  {
    files: ["src/modules/**/*.ts", "src/app/**/*.ts"],
    ignores: ["src/lib/managedTransaction.ts", "src/modules/notifications/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='$transaction']",
          message:
            "Direct prisma.$transaction() is banned. Use runManagedTransaction() from @/lib/managed-transaction to ensure statement_timeout, lock_timeout, and idle_in_transaction_session_timeout guards are always active.",
        },
        {
          selector: "MemberExpression[property.name='emailJob']",
          message:
            "Direct .emailJob access is banned outside src/modules/notifications. Use enqueueNotification() (inside a transaction) or sendImmediateNotification() from @/modules/notifications/notification.service — those preserve the outbox/transaction guarantee, idempotency via dedupeKey, and the audit trail.",
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
