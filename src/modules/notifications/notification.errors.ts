import { EmailDeliveryError } from "@/lib/mail";

export type FailureClass = "TRANSIENT" | "PERMANENT";

/**
 * Decide whether an email-send failure should be retried or buried.
 *
 * - TRANSIENT: network blips, timeouts, 4xx SMTP, DNS — worth another attempt.
 * - PERMANENT: 5xx SMTP, EAUTH, bad envelope/message — retrying won't help;
 *   mark DEAD so it stops burning queue capacity.
 *
 * When in doubt → TRANSIENT (the lease + maxAttempts ceiling caps the cost).
 */
export function classifyEmailError(error: unknown): FailureClass {
  const root =
    error instanceof EmailDeliveryError ? (error.cause ?? error) : error;

  if (!root || typeof root !== "object") return "TRANSIENT";

  const e = root as { code?: string; responseCode?: number };

  if (e.code) {
    switch (e.code) {
      case "ETIMEDOUT":
      case "ECONNECTION":
      case "ECONNRESET":
      case "ESOCKET":
      case "ESTREAM":
      case "EDNS":
        return "TRANSIENT";
      case "EENVELOPE":
      case "EMESSAGE":
      case "EAUTH":
      case "EPROTOCOL":
        return "PERMANENT";
    }
  }

  if (typeof e.responseCode === "number") {
    if (e.responseCode >= 500) return "PERMANENT";
    if (e.responseCode >= 400) return "TRANSIENT";
  }

  return "TRANSIENT";
}
