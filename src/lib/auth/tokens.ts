import { createHash, randomBytes } from "node:crypto";

import type { PasswordTokenPurpose } from "@/Schemas/common.schema";

/*
 * Password links (reset and invite): 256-bit random tokens. Only the SHA-256
 * hash is stored; the raw token exists in the emailed link alone.
 */

export const PASSWORD_TOKEN_TTL_MS: Record<PasswordTokenPurpose, number> = {
  RESET: 60 * 60 * 1000, // 1 hour
  INVITE: 3 * 24 * 60 * 60 * 1000, // 3 days
};

export const PASSWORD_TOKEN_TTL_TEXT: Record<PasswordTokenPurpose, string> = {
  RESET: "1 hour",
  INVITE: "3 days",
};

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function passwordTokenExpiry(purpose: PasswordTokenPurpose, from = new Date()): Date {
  return new Date(from.getTime() + PASSWORD_TOKEN_TTL_MS[purpose]);
}

/** Path of the page that redeems both reset and invite links. */
export function passwordLinkPath(rawToken: string): string {
  return `/admin/reset-password?token=${encodeURIComponent(rawToken)}`;
}
