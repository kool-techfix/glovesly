import { queueEmail } from "@/lib/email/mailer";
import {
  appUrl,
  contactMessageAlertEmail,
  inviteEmail,
  passwordResetEmail,
} from "@/lib/email/templates";
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

  /** Staff alert for a new contact message; replying answers the sender. */
  sendContactAlert(
    to: string,
    message: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      company: string | null;
      subject: string | null;
      message: string;
    },
  ) {
    const email = contactMessageAlertEmail({
      ...message,
      inboxLink: appUrl(`/admin/messages?id=${encodeURIComponent(message.id)}`),
    });
    queueEmail({ to, replyTo: message.email, tag: "contact-alert", ...email });
  },
};
