import "server-only";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const DEFAULT_EMAIL_TIMEOUT_MS = 8_000;

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    signal?: AbortSignal;
    timeoutMs?: number;
    throwOnFailure?: boolean;
}

export class EmailDeliveryError extends Error {
    constructor(message: string, public cause?: unknown) {
        super(message);
        this.name = "EmailDeliveryError";
    }
}

function assertEmailConfig(): { user: string; pass: string } {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        throw new Error("EMAIL_USER or EMAIL_PASS missing in .env");
    }

    return { user, pass };
}

function assertNotAborted(signal: AbortSignal | undefined): void {
    if (signal?.aborted) {
        throw new EmailDeliveryError("Email delivery cancelled before SMTP connection started");
    }
}

async function withAbortAndTimeout<T>(
    task: Promise<T>,
    options: {
        signal?: AbortSignal;
        timeoutMs: number;
        onAbort: () => void;
    }
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let abortHandler: (() => void) | undefined;

    const guard = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            options.onAbort();
            reject(new EmailDeliveryError(`Email delivery timed out after ${options.timeoutMs}ms`));
        }, options.timeoutMs);

        if (options.signal) {
            abortHandler = () => {
                options.onAbort();
                reject(new EmailDeliveryError("Email delivery cancelled"));
            };
            options.signal.addEventListener("abort", abortHandler, { once: true });
        }
    });

    try {
        return await Promise.race([task, guard]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (options.signal && abortHandler) {
            options.signal.removeEventListener("abort", abortHandler);
        }
    }
}

/**
 * Sends a transactional email via Gmail SMTP.
 * This module is server-only — nodemailer uses Node.js APIs (net, tls, fs)
 * that are not available in the browser or Edge runtime.
 */
export const sendEmail = async ({
    to,
    subject,
    html,
    text,
    signal,
    timeoutMs = DEFAULT_EMAIL_TIMEOUT_MS,
    throwOnFailure = false,
}: SendEmailOptions): Promise<void> => {
    assertNotAborted(signal);
    const { user, pass } = assertEmailConfig();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        connectionTimeout: timeoutMs,
        greetingTimeout: timeoutMs,
        socketTimeout: timeoutMs,
        auth: {
            user,
            pass,
        },
    } satisfies SMTPTransport.Options);

    try {
        await withAbortAndTimeout(
            transporter.sendMail({
                from: `"Rajput Foods Sweden" <${user}>`,
                to,
                subject,
                html,
                text,
            }),
            {
                signal,
                timeoutMs,
                onAbort: () => transporter.close(),
            }
        );
    } catch (error) {
        console.error(
            `[${new Date().toLocaleString("sv-SE")}] Email delivery failed to ${to}:`,
            error
        );

        if (throwOnFailure) {
            throw error instanceof EmailDeliveryError
                ? error
                : new EmailDeliveryError(`Email delivery failed to ${to}`, error);
        }

        // We do NOT throw here because we don't want a failed email delivery
        // (e.g. to a fictional test email) to crash the entire user registration
        // or admin creation flow.
    } finally {
        transporter.close();
    }
};
