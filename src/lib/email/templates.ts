import { getEnv } from "@/lib/env";

/*
 * Branded transactional emails. Every template returns escaped HTML plus a
 * plain-text alternative. Interpolate user data only through escapeHtml().
 */

const BRAND = {
  name: "Glovesly Pro-Project",
  primary: "#1e73be",
  foreground: "#14181f",
  muted: "#505858",
  border: "#e0e0e0",
  band: "#f8f8f8",
};

export type RenderedEmail = { subject: string; html: string; text: string };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Absolute URL for a path, based on APP_URL. */
export function appUrl(path: string): string {
  const base = getEnv().APP_URL;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function paragraph(html: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.foreground};">${html}</p>`;
}

function button(label: string, href: string) {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:${BRAND.primary};color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;">${escapeHtml(label)}</a></p>`;
}

function layout(options: { preheader: string; heading: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(options.heading)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.band};font-family:Arial,Helvetica,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(options.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.band};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
<tr><td style="padding:20px 32px;border-bottom:3px solid ${BRAND.primary};font-weight:700;font-size:16px;color:${BRAND.foreground};">${BRAND.name}</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:${BRAND.foreground};">${escapeHtml(options.heading)}</h1>
${options.bodyHtml}
</td></tr>
<tr><td style="padding:16px 32px;background:${BRAND.band};font-size:12px;line-height:1.5;color:${BRAND.muted};">${BRAND.name}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function textLayout(heading: string, lines: string[]) {
  return [BRAND.name, "", heading, "", ...lines, "", `— ${BRAND.name}`].join("\n");
}

export function inviteEmail(input: {
  name: string;
  inviterName: string;
  link: string;
  expiresInText: string;
}): RenderedEmail {
  const heading = "You have been invited to the Glovesly admin";
  const subject = `Your ${BRAND.name} admin invitation`;
  const html = layout({
    preheader: `${input.inviterName} invited you to manage the website.`,
    heading,
    bodyHtml: [
      paragraph(`Hello ${escapeHtml(input.name)},`),
      paragraph(
        `${escapeHtml(input.inviterName)} has invited you to manage the ${BRAND.name} website. Set your password to activate your account.`,
      ),
      button("Set your password", input.link),
      paragraph(
        `This link expires in ${escapeHtml(input.expiresInText)} and can be used once. If you were not expecting this invitation, you can ignore this email.`,
      ),
    ].join("\n"),
  });
  const text = textLayout(heading, [
    `Hello ${input.name},`,
    "",
    `${input.inviterName} has invited you to manage the ${BRAND.name} website.`,
    `Set your password: ${input.link}`,
    "",
    `This link expires in ${input.expiresInText} and can be used once.`,
  ]);
  return { subject, html, text };
}

export function passwordResetEmail(input: {
  name: string;
  link: string;
  expiresInText: string;
}): RenderedEmail {
  const heading = "Reset your password";
  const subject = `Reset your ${BRAND.name} admin password`;
  const html = layout({
    preheader: "Use this link to choose a new password.",
    heading,
    bodyHtml: [
      paragraph(`Hello ${escapeHtml(input.name)},`),
      paragraph("We received a request to reset the password for your admin account."),
      button("Choose a new password", input.link),
      paragraph(
        `This link expires in ${escapeHtml(input.expiresInText)} and can be used once. If you did not ask for this, you can ignore this email; your password will not change.`,
      ),
    ].join("\n"),
  });
  const text = textLayout(heading, [
    `Hello ${input.name},`,
    "",
    "We received a request to reset the password for your admin account.",
    `Choose a new password: ${input.link}`,
    "",
    `This link expires in ${input.expiresInText} and can be used once.`,
    "If you did not ask for this, you can ignore this email.",
  ]);
  return { subject, html, text };
}

export function contactMessageAlertEmail(input: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  message: string;
  inboxLink: string;
}): RenderedEmail {
  const heading = "New contact message";
  const subject = `New message from ${input.name}${input.subject ? `: ${input.subject}` : ""}`;
  const rows: Array<[string, string | null | undefined]> = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
    ["Company", input.company],
    ["Subject", input.subject],
  ];
  const table = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:${BRAND.muted};font-size:14px;">${label}</td><td style="padding:4px 0;font-size:14px;color:${BRAND.foreground};">${escapeHtml(value!)}</td></tr>`,
    )
    .join("");
  const html = layout({
    preheader: `${input.name} sent a message through the website.`,
    heading,
    bodyHtml: [
      `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">${table}</table>`,
      `<div style="padding:16px;border-left:3px solid ${BRAND.primary};background:${BRAND.band};font-size:15px;line-height:1.6;color:${BRAND.foreground};white-space:pre-wrap;">${escapeHtml(input.message)}</div>`,
      button("Open the inbox", input.inboxLink),
      paragraph("Reply to this email to answer the sender directly."),
    ].join("\n"),
  });
  const text = textLayout(heading, [
    ...rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`),
    "",
    input.message,
    "",
    `Inbox: ${input.inboxLink}`,
  ]);
  return { subject, html, text };
}

/** Acknowledgement to a job applicant. No promises about timelines or outcomes. */
export function applicationReceivedEmail(input: { fullName: string; positionLabel: string }): RenderedEmail {
  const heading = "We received your application";
  const subject = `We received your application for ${input.positionLabel}`;
  const html = layout({
    preheader: `We received your application for ${input.positionLabel}.`,
    heading,
    bodyHtml: [
      paragraph(`Dear ${escapeHtml(input.fullName)},`),
      paragraph(`We received your application for <strong>${escapeHtml(input.positionLabel)}</strong>.`),
      paragraph("Thank you for your interest in Glovesly Pro-Project Limited."),
    ].join("\n"),
  });
  const text = textLayout(heading, [
    `Dear ${input.fullName},`,
    "",
    `We received your application for ${input.positionLabel}.`,
    "",
    "Thank you for your interest in Glovesly Pro-Project Limited.",
  ]);
  return { subject, html, text };
}

/** Staff alert for a new job application. The CV itself is only in the admin. */
export function applicationAlertEmail(input: {
  fullName: string;
  email: string;
  phone: string;
  positionLabel: string;
  message: string | null;
  cvFilename: string;
  adminLink: string;
}): RenderedEmail {
  const heading = "New job application";
  const subject = `New application: ${input.positionLabel} (${input.fullName})`;
  const rows: Array<[string, string]> = [
    ["Position", input.positionLabel],
    ["Name", input.fullName],
    ["Email", input.email],
    ["Phone", input.phone],
    ["CV", input.cvFilename],
  ];
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:${BRAND.muted};font-size:14px;">${label}</td><td style="padding:4px 0;font-size:14px;color:${BRAND.foreground};">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html = layout({
    preheader: `${input.fullName} applied for ${input.positionLabel}.`,
    heading,
    bodyHtml: [
      `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">${table}</table>`,
      input.message
        ? `<div style="padding:16px;border-left:3px solid ${BRAND.primary};background:${BRAND.band};font-size:15px;line-height:1.6;color:${BRAND.foreground};white-space:pre-wrap;">${escapeHtml(input.message)}</div>`
        : "",
      button("Open the application", input.adminLink),
      paragraph("The CV can be downloaded from the admin. Reply to this email to answer the applicant directly."),
    ].join("\n"),
  });
  const text = textLayout(heading, [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(input.message ? ["", input.message] : []),
    "",
    `Application: ${input.adminLink}`,
  ]);
  return { subject, html, text };
}
