import "server-only";
import nodemailer from "nodemailer";

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Sends a transactional email via Gmail SMTP.
 * This module is server-only — nodemailer uses Node.js APIs (net, tls, fs)
 * that are not available in the browser or Edge runtime.
 */
export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER or EMAIL_PASS missing in .env");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Rajput Foods Sweden" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error(
            `[${new Date().toLocaleString("sv-SE")}] Email delivery failed to ${to}:`,
            error
        );
        // We do NOT throw here because we don't want a failed email delivery
        // (e.g. to a fictional test email) to crash the entire user registration
        // or admin creation flow.
    }
};
