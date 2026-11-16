import { ApiError } from "@/lib/api/api-error";
import { hashPassword } from "@/lib/auth/password";
import { generateToken, hashToken, passwordTokenExpiry } from "@/lib/auth/tokens";
import { enforceRateLimit, HOUR, MINUTE } from "@/lib/rate-limit";
import { passwordTokenRepository } from "@/Repositories/password-token.repository";
import { userRepository } from "@/Repositories/user.repository";
import type { PasswordTokenPurpose } from "@/Schemas/common.schema";
import { activityService } from "@/Services/activity.service";
import { notificationService } from "@/Services/notification.service";

/*
 * Reset (1 hour) and invite (3 days) links. Single-use; issuing a new link
 * invalidates older ones; setting a password signs out every session.
 */

const INVALID_LINK = "This link is invalid or has expired. Ask for a new one.";

export type PasswordLinkCheck =
  | { valid: false }
  | { valid: true; purpose: PasswordTokenPurpose; email: string; name: string };

async function findUsableToken(rawToken: string) {
  const token = await passwordTokenRepository.findByHash(hashToken(rawToken));
  if (!token || token.usedAt !== null || token.expiresAt.getTime() <= Date.now()) return null;
  if (token.user.status !== "ACTIVE") return null;
  return token;
}

export const passwordService = {
  /** Creates a link for the user and emails it. The raw token is never returned. */
  async issueLink(
    user: { id: string; email: string; name: string },
    purpose: PasswordTokenPurpose,
    inviterName?: string,
  ) {
    const rawToken = generateToken();
    await passwordTokenRepository.issue({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      purpose,
      expiresAt: passwordTokenExpiry(purpose),
    });

    if (purpose === "INVITE") {
      notificationService.sendInvite(user, inviterName ?? "An administrator", rawToken);
    } else {
      notificationService.sendPasswordReset(user, rawToken);
    }
  },

  /** "Forgot password?". Always resolves the same way, whether or not the email exists. */
  async requestReset(email: string, ip: string) {
    enforceRateLimit(
      [`pw-forgot:ip:${ip}`, { limit: 10, windowMs: 15 * MINUTE }],
      [`pw-forgot:email:${email}`, { limit: 3, windowMs: HOUR }],
    );

    const user = await userRepository.findByEmail(email);
    if (user && user.status === "ACTIVE") {
      await passwordService.issueLink(user, "RESET");
    }
  },

  async checkLink(rawToken: string, ip: string): Promise<PasswordLinkCheck> {
    enforceRateLimit([`pw-check:ip:${ip}`, { limit: 30, windowMs: 15 * MINUTE }]);
    const token = await findUsableToken(rawToken);
    if (!token) return { valid: false };
    return { valid: true, purpose: token.purpose, email: token.user.email, name: token.user.name };
  },

  /** Sets the password from a link and signs out every session of that user. */
  async resetPassword(rawToken: string, newPassword: string, ip: string) {
    enforceRateLimit([`pw-reset:ip:${ip}`, { limit: 10, windowMs: 15 * MINUTE }]);

    const token = await findUsableToken(rawToken);
    if (!token) throw ApiError.validation(INVALID_LINK, { token: INVALID_LINK });

    const redeemed = await passwordTokenRepository.redeem(
      token.id,
      token.userId,
      await hashPassword(newPassword),
    );
    if (!redeemed) throw ApiError.validation(INVALID_LINK, { token: INVALID_LINK });

    await activityService.record(
      { id: token.userId },
      {
        action: token.purpose === "INVITE" ? "invite_accepted" : "password_reset",
        entityType: "user",
        entityId: token.userId,
        summary:
          token.purpose === "INVITE"
            ? `${token.user.email} accepted their invite`
            : `${token.user.email} reset their password`,
      },
    );
    return { purpose: token.purpose };
  },
};
