import "server-only";

import { sendEmail } from "@/lib/mail";
import { EmailJob } from "@/generated/prisma/client";
import { classifyEmailError } from "./notification.errors";
import { renderNotification } from "./notification.renderers";
import {
  claimBatch,
  markDead,
  markFailureForRetry,
  markSent,
} from "./notification.repository";
import {
  NOTIFICATION_SCHEMAS,
  type NotificationEvent,
  type NotificationType,
} from "./notification.types";

const BACKOFF_BASE_SECONDS = 60;
const BACKOFF_CAP_SECONDS = 60 * 60;

export interface DrainResult {
  claimed: number;
  sent: number;
  retried: number;
  dead: number;
}

/**
 * Drain up to `batchSize` jobs. Safe to invoke concurrently — the SQL claim
 * uses FOR UPDATE SKIP LOCKED, so two callers will operate on disjoint rows.
 *
 * Called from:
 *   - Next.js `after()` immediately following an enqueue (covers happy path).
 *   - The /api/cron/notifications endpoint every 5 minutes (catches retries
 *     and stuck-lease recovery).
 */
export async function drainNotificationQueue(options?: {
  batchSize?: number;
  signal?: AbortSignal;
}): Promise<DrainResult> {
  const batchSize = options?.batchSize ?? 25;
  const jobs = await claimBatch(batchSize);

  const result: DrainResult = {
    claimed: jobs.length,
    sent: 0,
    retried: 0,
    dead: 0,
  };

  for (const job of jobs) {
    if (options?.signal?.aborted) break;
    const outcome = await processJob(job, options?.signal);
    if (outcome === "sent") result.sent += 1;
    else if (outcome === "retried") result.retried += 1;
    else result.dead += 1;
  }

  return result;
}

type Outcome = "sent" | "retried" | "dead";

async function processJob(
  job: EmailJob,
  signal: AbortSignal | undefined,
): Promise<Outcome> {
  const attempts = job.attempts + 1;

  // 1) Parse payload defensively — schema drift or a corrupted row should
  //    fail permanently rather than burn retries.
  const schema = NOTIFICATION_SCHEMAS[job.type as NotificationType];
  if (!schema) {
    await markDead(job.id, attempts, `[PERMANENT] unknown event type: ${job.type}`);
    return "dead";
  }

  const parsed = schema.safeParse(job.payload);
  if (!parsed.success) {
    await markDead(
      job.id,
      attempts,
      `[PERMANENT] payload validation failed: ${parsed.error.message}`,
    );
    return "dead";
  }

  const event = {
    type: job.type,
    payload: parsed.data,
    dedupeKey: job.dedupeKey ?? undefined,
  } as NotificationEvent;

  // 2) Render. Null means the underlying entity is gone — permanent skip.
  let rendered;
  try {
    rendered = await renderNotification(event);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await markDead(job.id, attempts, `[PERMANENT] render failed: ${message}`);
    return "dead";
  }
  if (!rendered) {
    await markDead(job.id, attempts, "[PERMANENT] render skipped (entity not found)");
    return "dead";
  }

  // 3) Send. Classification decides retry vs dead.
  try {
    await sendEmail({
      to: rendered.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      signal,
      throwOnFailure: true,
    });
  } catch (err) {
    const cls = classifyEmailError(err);
    const message = err instanceof Error ? err.message : String(err);
    const tagged = `[${cls}] ${message}`;

    if (cls === "PERMANENT" || attempts >= job.maxAttempts) {
      await markDead(job.id, attempts, tagged);
      return "dead";
    }

    await markFailureForRetry(job.id, attempts, tagged, computeNextAttempt(attempts));
    return "retried";
  }

  await markSent(job.id);
  return "sent";
}

function computeNextAttempt(attempts: number): Date {
  const seconds = Math.min(
    BACKOFF_BASE_SECONDS * Math.pow(2, attempts - 1),
    BACKOFF_CAP_SECONDS,
  );
  return new Date(Date.now() + seconds * 1000);
}
