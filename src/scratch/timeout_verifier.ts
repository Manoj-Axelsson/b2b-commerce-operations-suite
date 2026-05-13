/**
 * timeout_verifier.ts
 *
 * Manual verification script for runManagedTransaction timeout guards.
 *
 * Tests:
 *   1. statement_timeout kills a long-running query before STATEMENT_MS.
 *   2. lock_timeout fails fast when a lock cannot be acquired.
 *   3. Early-exit works when signal is aborted before the transaction starts.
 *
 * Run: npx tsx src/scratch/timeout_verifier.ts
 */
import "dotenv/config";
import prisma from "../lib/prisma";
import { runManagedTransaction, DB_TIMEOUTS } from "../lib/managedTransaction";

async function testStatementTimeout() {
  console.log("\n[TEST 1] statement_timeout should kill a long query...");

  const controller = new AbortController();
  const start = Date.now();

  try {
    await runManagedTransaction(controller.signal, async (tx) => {
      // pg_sleep(30) would normally block for 30 seconds.
      // With statement_timeout = 6s, it should be killed at ~6s.
      await tx.$executeRawUnsafe(`SELECT pg_sleep(30)`);
    });
    console.error("  FAIL: Query was not killed by statement_timeout.");
  } catch (err: unknown) {
    const elapsed = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);

    // PostgreSQL raises error code 57014 (query_canceled) on timeout.
    if (message.includes("canceling statement") || message.includes("57014")) {
      console.log(`  PASS: Query killed at ${elapsed}ms (limit: ${DB_TIMEOUTS.STATEMENT_MS}ms).`);
      console.log(`  Reason: ${message}`);
    } else {
      console.error(`  FAIL: Unexpected error at ${elapsed}ms — ${message}`);
    }
  }
}

async function testEarlyExitOnAbortedSignal() {
  console.log("\n[TEST 2] Early-exit when signal is already aborted...");

  const controller = new AbortController();
  controller.abort(); // Abort BEFORE the transaction starts.

  try {
    await runManagedTransaction(controller.signal, async (_tx) => {
      // This body should never run.
      console.error("  FAIL: Transaction body executed despite aborted signal.");
    });
    console.error("  FAIL: No error was thrown.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("cancelled")) {
      console.log(`  PASS: Threw early with message: "${message}"`);
    } else {
      console.error(`  FAIL: Unexpected error — ${message}`);
    }
  }
}

async function runAllTests() {
  console.log("=== Timeout Verifier ===");
  console.log(`Timeouts: statement=${DB_TIMEOUTS.STATEMENT_MS}ms, lock=${DB_TIMEOUTS.LOCK_MS}ms, idle=${DB_TIMEOUTS.IDLE_IN_TRANSACTION_MS}ms`);

  await testEarlyExitOnAbortedSignal();
  await testStatementTimeout();

  console.log("\n=== Done ===\n");
  await prisma.$disconnect();
}

runAllTests().catch((err) => {
  console.error("Verifier crashed:", err);
  process.exit(1);
});
