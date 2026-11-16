import { queueEmail } from "@/lib/email/mailer";
import { appUrl, inviteEmail, passwordResetEmail } from "@/lib/email/templates";
import { PASSWORD_TOKEN_TTL_TEXT, passwordLinkPath } from "@/lib/auth/tokens";

/*
 * All outgoing email goes through here. Delivery runs after the response
 * (queueEmail → next/server `after`), so it never slows or fails a request.
 */

export const notificationService = {
  sendInvite(user: { email: string; name: string }, inviterName: string, rawToken: string) {
    const email = inviteEmail({
      name: user.name,
      inviterName,
      link: appUrl(passwordLinkPath(rawToken)),
      expiresInText: PASSWORD_TOKEN_TTL_TEXT.INVITE,
    });
    queueEmail({ to: user.email, tag: "account-invite", ...email });
  },

  sendPasswordReset(user: { email: string; name: string }, rawToken: string) {
    const email = passwordResetEmail({
      name: user.name,
      link: appUrl(passwordLinkPath(rawToken)),
      expiresInText: PASSWORD_TOKEN_TTL_TEXT.RESET,
    });
    queueEmail({ to: user.email, tag: "password-reset", ...email });
  },
};
