"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/*
 * Posts to /api/public/contact. Server field errors (422 details) are shown
 * under the matching field. "website_url" is the honeypot: hidden from people,
 * filled in by bots, silently dropped by the server.
 */

type FieldName = "name" | "email" | "phone" | "company" | "subject" | "message";

const FIELDS: Array<{
  name: FieldName;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  textarea?: boolean;
  wide?: boolean;
}> = [
  { name: "name", label: "Your name", autoComplete: "name", required: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "company", label: "Company or organisation", autoComplete: "organization" },
  { name: "subject", label: "Subject", wide: true },
  { name: "message", label: "Message", textarea: true, required: true, wide: true },
];

export function ContactForm({ title, successMessage }: { title: string; successMessage: string }) {
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        form.reset();
        setSent(true);
        return;
      }
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string; details?: Record<string, string | string[]> };
      } | null;
      const details = body?.error?.details ?? {};
      const fieldErrors: Partial<Record<FieldName, string>> = {};
      for (const [path, message] of Object.entries(details)) {
        const field = path.split(".")[0] as FieldName;
        if (FIELDS.some((f) => f.name === field)) fieldErrors[field] = Array.isArray(message) ? message.join(" ") : message;
      }
      setErrors(fieldErrors);
      setFormError(
        response.status === 429
          ? "You have sent several messages in a short time. Please wait a few minutes and try again."
          : Object.keys(fieldErrors).length
            ? "Please check the highlighted fields."
            : (body?.error?.message ?? "Something went wrong. Please try again."),
      );
    } catch {
      setFormError("We could not send your message. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="contact-success" role="status" data-testid="text-contact-success">
        <CheckCircle2 aria-hidden="true" size={28} />
        <p>{successMessage}</p>
        <button type="button" className="button-secondary focus-ring" onClick={() => setSent(false)} data-testid="button-contact-another">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate data-testid="form-contact">
      <h2 className="display text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">required</span> are required.
      </p>
      <div className="contact-grid mt-6">
        {FIELDS.map((field) => {
          const id = `contact-${field.name}`;
          const error = errors[field.name];
          const common = {
            id,
            name: field.name,
            required: field.required,
            autoComplete: field.autoComplete,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? `${id}-error` : undefined,
            className: cn("form-input focus-ring", error && "form-input-invalid"),
          };
          return (
            <div key={field.name} className={cn("form-field", field.wide && "sm:col-span-2")}>
              <label htmlFor={id} className="form-label">
                {field.label}
                {field.required ? <span aria-hidden="true"> *</span> : null}
              </label>
              {field.textarea ? (
                <textarea {...common} rows={6} data-testid={`textarea-contact-${field.name}`} />
              ) : (
                <input {...common} type={field.type ?? "text"} data-testid={`input-contact-${field.name}`} />
              )}
              {error ? (
                <p id={`${id}-error`} className="form-error">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Honeypot: off-screen, skipped by keyboard and assistive tech. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website-url">Leave this field empty</label>
        <input id="contact-website-url" name="website_url" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {formError ? (
        <p className="form-banner-error mt-6" role="alert" data-testid="text-contact-error">
          {formError}
        </p>
      ) : null}

      <button type="submit" className="button-primary focus-ring mt-6" disabled={busy} data-testid="button-contact-submit">
        <span>{busy ? "Sending…" : "Send message"}</span>
        {busy ? <Loader2 aria-hidden="true" className="button-icon animate-spin" /> : <ArrowRight aria-hidden="true" className="button-icon" />}
      </button>
    </form>
  );
}
