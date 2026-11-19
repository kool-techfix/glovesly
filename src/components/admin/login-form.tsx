"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api, errorMessage } from "@/lib/admin/api-client";

/** Only same-site admin paths are allowed as a post-login destination. */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith("/admin/login") ? next : "/admin";
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/login", {
        method: "POST",
        noAuthRedirect: true,
        body: {
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          remember: form.get("remember") === "on",
        },
      });
      router.replace(safeNext(next));
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className="adm-form adm-auth-form" onSubmit={submit} data-testid="form-login">
      <div className="adm-field">
        <label htmlFor="login-email" className="adm-label">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="adm-input"
          data-testid="input-login-email"
        />
      </div>
      <div className="adm-field">
        <label htmlFor="login-password" className="adm-label">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="adm-input"
          data-testid="input-login-password"
        />
      </div>
      <div className="adm-auth-row">
        <label className="adm-check">
          <input type="checkbox" name="remember" data-testid="checkbox-login-remember" />
          <span>Keep me signed in</span>
        </label>
        <Link href="/admin/forgot-password" className="adm-link" data-testid="link-login-forgot">
          Forgot password?
        </Link>
      </div>
      {error ? (
        <p className="adm-form-error" role="alert" data-testid="text-login-error">
          {error}
        </p>
      ) : null}
      <button type="submit" className="adm-button adm-button--primary adm-button--block" disabled={busy} data-testid="button-login-submit">
        {busy ? <Loader2 aria-hidden size={16} className="adm-spin" /> : null}
        Sign in
      </button>
    </form>
  );
}
