"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminApiError, api, errorMessage } from "@/lib/admin/api-client";

type LinkCheck =
  | { valid: false }
  | { valid: true; purpose: "RESET" | "INVITE"; email: string; name: string };

/** Handles both invite links (set a first password) and reset links. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [check, setCheck] = useState<LinkCheck | "loading">(token ? "loading" : { valid: false });
  const [done, setDone] = useState<"RESET" | "INVITE" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<LinkCheck>("/api/auth/password/check", { method: "POST", noAuthRedirect: true, body: { token } })
      .then((result) => {
        if (!cancelled) setCheck(result);
      })
      .catch(() => {
        if (!cancelled) setCheck({ valid: false });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    setFormError(null);
    if (password !== confirm) {
      setErrors({ confirm: "The passwords do not match" });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const result = await api<{ purpose: "RESET" | "INVITE" }>("/api/auth/password/reset", {
        method: "POST",
        noAuthRedirect: true,
        body: { token, password },
      });
      setDone(result.purpose);
    } catch (error) {
      if (error instanceof AdminApiError) setErrors(error.fieldErrors());
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (check === "loading") {
    return (
      <p className="adm-auth-form" role="status">
        <Loader2 aria-hidden size={16} className="adm-spin" /> Checking your link…
      </p>
    );
  }

  if (done) {
    return (
      <div className="adm-auth-form" role="status" data-testid="text-reset-done">
        <p>{done === "INVITE" ? "Your password is set. You can now sign in." : "Your password has been changed. Sign in with the new password."}</p>
        <Link href="/admin/login" className="adm-button adm-button--primary adm-button--block" data-testid="link-reset-login">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!check.valid) {
    return (
      <div className="adm-auth-form" role="alert" data-testid="text-reset-invalid">
        <p>This link is invalid or has expired. Ask for a new one.</p>
        <Link href="/admin/forgot-password" className="adm-button adm-button--secondary adm-button--block" data-testid="link-reset-request">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form className="adm-form adm-auth-form" onSubmit={submit} data-testid="form-reset">
      <p className="adm-auth-description">
        {check.purpose === "INVITE" ? `Welcome, ${check.name}. Choose a password for ` : "Choose a new password for "}
        <strong>{check.email}</strong>.
      </p>
      <div className="adm-field">
        <label htmlFor="reset-password" className="adm-label">
          New password
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="adm-input"
          aria-describedby={errors.password ? "reset-password-error" : "reset-password-help"}
          data-testid="input-reset-password"
        />
        {errors.password ? (
          <p id="reset-password-error" className="adm-field-error">
            {errors.password}
          </p>
        ) : (
          <p id="reset-password-help" className="adm-field-help">
            At least 12 characters.
          </p>
        )}
      </div>
      <div className="adm-field">
        <label htmlFor="reset-confirm" className="adm-label">
          Confirm password
        </label>
        <input
          id="reset-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className="adm-input"
          aria-describedby={errors.confirm ? "reset-confirm-error" : undefined}
          data-testid="input-reset-confirm"
        />
        {errors.confirm ? (
          <p id="reset-confirm-error" className="adm-field-error">
            {errors.confirm}
          </p>
        ) : null}
      </div>
      {formError ? (
        <p className="adm-form-error" role="alert">
          {formError}
        </p>
      ) : null}
      <button type="submit" className="adm-button adm-button--primary adm-button--block" disabled={busy} data-testid="button-reset-submit">
        {busy ? <Loader2 aria-hidden size={16} className="adm-spin" /> : null}
        {check.purpose === "INVITE" ? "Set password" : "Change password"}
      </button>
    </form>
  );
}
