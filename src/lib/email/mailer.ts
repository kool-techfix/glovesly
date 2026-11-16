import { after } from "next/server";
import nodemailer, { type Transporter } from "nodemailer";

import { getEnv } from "@/lib/env";

/*
 * Nodemailer over SMTP, so any provider works. Configured by SMTP_HOST,
 * SMTP_PORT (587 STARTTLS by default, 465 implicit TLS with SMTP_SECURE=true),
 * SMTP_USER, SMTP_PASS and EMAIL_FROM. When credentials are set, TLS is
 * mandatory. Without SMTP_HOST, messages are logged in development and
 * skipped in production.
 */

export type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Category, sent as X-Tag (and X-PM-Tag for Postmark). */
  tag: string;
  headers?: Record<string, string>;
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const env = getEnv();
  if (!env.SMTP_HOST) return null;

  if (!transporter) {
    const hasAuth = Boolean(env.SMTP_USER && env.SMTP_PASS);
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      requireTLS: hasAuth && !env.SMTP_SECURE,
      auth: hasAuth ? { user: env.SMTP_USER!, pass: env.SMTP_PASS! } : undefined,
    });
  }
  return transporter;
}

/** Sends now. Prefer queueEmail() inside request handlers. */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const env = getEnv();
  const transport = getTransporter();

  if (!transport) {
    if (env.NODE_ENV === "production") {
      console.warn(`[email] SMTP_HOST not set; skipped "${message.tag}" email.`);
    } else {
      console.info(
        `[email] (dev, not sent) tag=${message.tag} to=${String(message.to)}\n` +
          `Subject: ${message.subject}\n\n${message.text}`,
      );
    }
    return;
  }

  await transport.sendMail({
    from: env.EMAIL_FROM,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: { "X-Tag": message.tag, "X-PM-Tag": message.tag, ...message.headers },
  });
}

/**
 * Sends after the response is sent (next/server `after`), so email never
 * slows down or fails the request. Failures are logged.
 */
export function queueEmail(message: EmailMessage): void {
  after(async () => {
    try {
      await sendEmail(message);
    } catch (error) {
      console.error(`[email] Failed to send "${message.tag}" email`, error);
    }
  });
}
