import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { BusinessError } from "@/lib/error";

// Single source of truth for all database timeout constants.
// Synchronized so no zombie query can outlive its parent API request.
export const DB_TIMEOUTS = {
  // Hard cap on any single statement. Set 1s above the API timeout (5s)
  // so the AbortSignal fires first, but the DB kills the query independently
  // if the cancellation signal never arrives (network failure, pool exhaustion).
  STATEMENT_MS: 6_000,

  // Max time any query will wait to acquire a row lock.
  // Prevents new requests from "stacking" behind zombie transactions
  // that hold FOR UPDATE locks after their parent request has died.
  LOCK_MS: 5_000,

  // Max idle time on a connection that is already inside an open transaction.
  // Covers the "lost TCP connection" edge case — the client disappears
  // but the DB connection stays alive, holding locks indefinitely.
  IDLE_IN_TRANSACTION_MS: 10_000,
} as const;

// Use Prisma's stable exported type — not fragile type inference.
type TransactionCallback<T> = (tx: Prisma.TransactionClient) => Promise<T>;

/**
 * The only authorised way to open a database transaction in this codebase.
 *
 * Wraps prisma.$transaction with three synchronized PostgreSQL timeout guards,
 * set as SET LOCAL — meaning they apply ONLY within this transaction and reset
 * automatically when it commits or rolls back. Safe to use with a shared pool.
 *
 * Layers of protection:
 *   0. AbortSignal early-exit           — stops before touching the DB if client is already gone.
 *   1. SET LOCAL statement_timeout      — hard-kills a running query at STATEMENT_MS.
 *   2. SET LOCAL lock_timeout           — fails fast if a lock cannot be acquired at LOCK_MS.
 *   3. SET LOCAL idle_in_transaction_session_timeout
 *                                       — reaps lost/idle connections at IDLE_IN_TRANSACTION_MS.
 *
 * @param signal   — AbortSignal from the HTTP request. Pass undefined to skip the early-exit.
 * @param callback — The transaction body, receives the scoped Prisma transaction client.
 */
export async function runManagedTransaction<T>(
  signal: AbortSignal | undefined,
  callback: TransactionCallback<T>
): Promise<T> {
  // Layer 0: Early exit — no point opening a transaction if the client is already gone.
  if (signal?.aborted) {
    throw new BusinessError("Request was cancelled before the transaction started.", 499);
  }

  return prisma.$transaction(async (tx) => {
    // Layers 1–3: Set all three hard timeout guards as the very first DB operation.
    // These MUST be separate calls — the pg driver does not support multi-statement
    // queries in a single $executeRawUnsafe call.
    await tx.$executeRawUnsafe(`SET LOCAL statement_timeout = ${DB_TIMEOUTS.STATEMENT_MS}`);
    await tx.$executeRawUnsafe(`SET LOCAL lock_timeout = ${DB_TIMEOUTS.LOCK_MS}`);
    await tx.$executeRawUnsafe(
      `SET LOCAL idle_in_transaction_session_timeout = ${DB_TIMEOUTS.IDLE_IN_TRANSACTION_MS}`
    );

    // All guards are now active. Pass control to the caller's business logic.
    return callback(tx);
  });
}
