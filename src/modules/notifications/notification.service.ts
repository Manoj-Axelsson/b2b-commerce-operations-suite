import "server-only";

import { randomUUID } from "node:crypto";
import { sendEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { classifyEmailError } from "./notification.errors";
import { renderNotification } from "./notification.renderers";
import { markDead, markSent } from "./notification.repository";
import { NOTIFICATION_SCHEMAS, type NotificationEvent } from "./notification.types";

/**
 * Validate the payload against the per-type Zod schema.
 * Throws at the API boundary so a malformed call site fails fast.
 */
function parseEvent(event: NotificationEvent): void {
  const schema = NOTIFICATION_SCHEMAS[event.type];
  schema.parse(event.payload);
}

/**
 * Runtime guard against passing the base PrismaClient where a TransactionClient
 * is required. The TS type already enforces this at compile time, but the two
 * are structurally compatible, so a misuse (e.g. importing the wrong client)
 * could slip past TS. Prisma's TransactionClient is `Omit<PrismaClient,
 * "$transaction" | "$connect" | …>` — checking for `$transaction` is the
 * cheapest reliable signal that we're outside a transaction.
 *
 * This protects the outbox guarantee: the EmailJob row MUST commit atomically
 * with the surrounding business write, otherwise we lose the "all or nothing"
 * property the design depends on.
 */
function assertInTransaction(tx: Prisma.TransactionClient): void {
  if ("$transaction" in tx) {
    throw new Error(
      "enqueueNotification: received the base PrismaClient. " +
        "Must be called inside prisma.$transaction(...) or runManagedTransaction() " +
        "so the EmailJob row commits atomically with the surrounding write.",
    );
  }
}

/**
 * Outbox enqueue. MUST run inside a Prisma transaction so the EmailJob row
 * commits atomically with the surrounding business write (e.g. order status
 * update + order event audit row + this enqueue all land together or none do).
 *
 * Uses INSERT ... ON CONFLICT (dedupeKey) DO NOTHING so a duplicate dedupeKey
 * is an idempotent no-op rather than poisoning the surrounding transaction.
 * (Catching P2002 in TS would not work — Postgres aborts the transaction on
 * the failed constraint check before the catch runs.)
 *
 * Returns `{ enqueued: false }` when a row with the same dedupeKey already
 * exists; callers can use this to skip a redundant downstream drain.
 */
export async function enqueueNotification(
  event: NotificationEvent,
  tx: Prisma.TransactionClient,
): Promise<{ enqueued: boolean }> {
  assertInTransaction(tx);
  parseEvent(event);

  const id = randomUUID();
  const payloadJson = JSON.stringify(event.payload);

  const inserted = await tx.$executeRaw`
    INSERT INTO "EmailJob" (
      id, type, payload, "dedupeKey",
      "maxAttempts", status, attempts,
      "nextAttemptAt", "createdAt", "updatedAt"
    )
    VALUES (
      ${id}::uuid,
      ${event.type},
      ${payloadJson}::jsonb,
      ${event.dedupeKey ?? null},
      5,
      'PENDING',
      0,
      NOW(), NOW(), NOW()
    )
    ON CONFLICT ("dedupeKey") DO NOTHING;
  `;

  return { enqueued: inserted === 1 };
}

/**
 * Synchronous send path for flows where the user is waiting on the response
 * (password reset link, email verification). Renders + sends + records a row
 * in EmailJob with terminal status SENT or DEAD, so the audit trail covers
 * immediate sends too. No retry — the caller is on the request path and
 * needs an answer now.
 *
 * Honors dedupeKey: if a row with the same key already exists (queued OR
 * sent previously), this returns `{ sent: false }` without contacting SMTP.
 */
export async function sendImmediateNotification(
  event: NotificationEvent,
  opts?: { signal?: AbortSignal },
): Promise<{ sent: boolean }> {
  parseEvent(event);

  const id = randomUUID();
  const payloadJson = JSON.stringify(event.payload);

  // Try to claim the (id, dedupeKey) slot immediately as PROCESSING.
  // If another caller owns the dedupeKey, we get zero rows and treat it as
  // already-handled.
  const claimed = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "EmailJob" (
      id, type, payload, "dedupeKey",
      "maxAttempts", status, attempts,
      "nextAttemptAt", "processingAt", "createdAt", "updatedAt"
    )
    VALUES (
      ${id}::uuid,
      ${event.type},
      ${payloadJson}::jsonb,
      ${event.dedupeKey ?? null},
      1,
      'PROCESSING',
      1,
      NOW(), NOW(), NOW(), NOW()
    )
    ON CONFLICT ("dedupeKey") DO NOTHING
    RETURNING id;
  `;
  if (claimed.length === 0) return { sent: false };

  const jobId = claimed[0].id;

  const rendered = await renderNotification(event);
  if (!rendered) {
    await markDead(jobId, 1, "[PERMANENT] render returned null (entity not found)");
    throw new Error(`Cannot render notification ${event.type}: entity not found`);
  }

  try {
    await sendEmail({
      to: rendered.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      signal: opts?.signal,
      throwOnFailure: true,
    });
  } catch (err) {
    const cls = classifyEmailError(err);
    const message = err instanceof Error ? err.message : String(err);
    await markDead(jobId, 1, `[${cls}] ${message}`);
    throw err;
  }

  await markSent(jobId);
  return { sent: true };
}
