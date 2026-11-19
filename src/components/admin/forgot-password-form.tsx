"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { api, errorMessage } from "@/lib/admin/api-client";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/password/forgot", { method: "POST", noAuthRedirect: true, body: { email } });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="adm-auth-form" role="status" data-testid="text-forgot-sent">
        <p>If an active account uses that address, we have sent it a link to reset the password. The link works for one hour.</p>
        <Link href="/admin/login" className="adm-button adm-button--secondary adm-button--block" data-testid="link-forgot-back">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="adm-form adm-auth-form" onSubmit={submit} data-testid="form-forgot">
      <div className="adm-field">
        <label htmlFor="forgot-email" className="adm-label">
          Email
        </label>
        <input id="forgot-email" name="email" type="email" autoComplete="email" required className="adm-input" data-testid="input-forgot-email" />
      </div>
      {error ? (
        <p className="adm-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="adm-button adm-button--primary adm-button--block" disabled={busy} data-testid="button-forgot-submit">
        {busy ? <Loader2 aria-hidden size={16} className="adm-spin" /> : null}
        Send reset link
      </button>
      <Link href="/admin/login" className="adm-link adm-auth-back" data-testid="link-forgot-login">
        Back to sign in
      </Link>
    </form>
  );
}
