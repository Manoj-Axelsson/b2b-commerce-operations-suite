import "server-only";

import prisma from "@/lib/prisma";
import { EmailJob, EmailJobStatus, Prisma } from "@/generated/prisma/client";

const LEASE_INTERVAL_SQL = Prisma.sql`INTERVAL '2 minutes'`;

/**
 * Claim up to `batchSize` jobs in a single atomic UPDATE.
 *
 * Picks rows that are:
 *   - PENDING and due (nextAttemptAt <= NOW), OR
 *   - PROCESSING but past their 2-minute lease (worker crashed mid-send).
 *
 * Uses `FOR UPDATE SKIP LOCKED` so concurrent dispatchers see disjoint sets.
 * `status` and `processingAt` flip together in the same SET — no window where
 * a second worker could re-claim while we hold a stale lease.
 */
export async function claimBatch(batchSize: number): Promise<EmailJob[]> {
  return prisma.$queryRaw<EmailJob[]>`
    UPDATE "EmailJob"
    SET    status         = 'PROCESSING',
           "processingAt" = NOW(),
           "updatedAt"    = NOW()
    WHERE  id IN (
      SELECT id
      FROM   "EmailJob"
      WHERE  (status = 'PENDING'    AND "nextAttemptAt" <= NOW())
         OR  (status = 'PROCESSING' AND "processingAt"  <  NOW() - ${LEASE_INTERVAL_SQL})
      ORDER  BY "nextAttemptAt" ASC
      LIMIT  ${batchSize}
      FOR    UPDATE SKIP LOCKED
    )
    RETURNING *;
  `;
}

export async function markSent(id: string): Promise<void> {
  await prisma.emailJob.update({
    where: { id },
    data: {
      status: EmailJobStatus.SENT,
      sentAt: new Date(),
      lastError: null,
      processingAt: null,
    },
  });
}

export async function markFailureForRetry(
  id: string,
  attempts: number,
  lastError: string,
  nextAttemptAt: Date,
): Promise<void> {
  await prisma.emailJob.update({
    where: { id },
    data: {
      status: EmailJobStatus.PENDING,
      attempts,
      lastError,
      nextAttemptAt,
      processingAt: null,
    },
  });
}

export async function markDead(
  id: string,
  attempts: number,
  lastError: string,
): Promise<void> {
  await prisma.emailJob.update({
    where: { id },
    data: {
      status: EmailJobStatus.DEAD,
      attempts,
      lastError,
      processingAt: null,
    },
  });
}
