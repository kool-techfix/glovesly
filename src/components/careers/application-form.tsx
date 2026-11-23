"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, FileText, Upload, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";

import {
  APPLICATION_HONEYPOT_FIELD,
  APPLICATION_MESSAGE_MAX,
  applicationFieldsSchema,
  type ApplicationFields,
  type ApplicationFieldsInput,
} from "@/lib/careers/application-form";
import { CV_ACCEPT, cvProblem, formatBytes } from "@/lib/careers/cv-rules";
import { cn } from "@/lib/utils";

/*
 * Job application form (vacancy pages and /careers/apply).
 * - react-hook-form + the Zod schema shared with POST /api/public/applications.
 * - The CV is checked here (type, size, not empty) before upload; the server
 *   checks again, including the file's magic bytes.
 * - Sent with XMLHttpRequest so the upload shows real progress.
 * - On error everything entered is kept (the file too) and the user can retry.
 */

type FieldName = "fullName" | "email" | "phone" | "message" | "consent" | "cv" | "areaOfInterest";
type Phase = { kind: "idle" } | { kind: "sending"; progress: number } | { kind: "error"; message: string } | { kind: "done" };

const FIELD_ORDER: FieldName[] = ["fullName", "email", "phone", "areaOfInterest", "message", "cv", "consent"];
const FIELD_LABELS: Record<FieldName, string> = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone",
  areaOfInterest: "Area of interest",
  message: "Cover letter or additional message",
  cv: "CV",
  consent: "Consent",
};

export function ApplicationForm({
  positionLabel,
  vacancyId,
  areasOfInterest,
  consentText,
  successTitle,
}: {
  positionLabel: string;
  /** Empty for a general application. */
  vacancyId?: string;
  /** General applications: service titles (+ "Other"). */
  areasOfInterest?: string[];
  consentText: string;
  successTitle: string;
}) {
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;
  const errorId = (name: string) => `${id}-${name}-error`;

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ApplicationFieldsInput, unknown, ApplicationFields>({
    // The schema transforms its input (e.g. consent "true" → true); resolvers 3.x types cannot express that.
    resolver: zodResolver(applicationFieldsSchema) as unknown as Resolver<ApplicationFieldsInput, unknown, ApplicationFields>,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
      consent: false,
      vacancyId: vacancyId ?? "",
      areaOfInterest: "",
      [APPLICATION_HONEYPOT_FIELD]: "",
    },
    shouldFocusError: false,
  });

  const [file, setFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [summaryKey, setSummaryKey] = useState(0);
  const sending = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const messageLength = (useWatch({ control, name: "message" }) ?? "").length;

  // Collected errors for the summary, in field order.
  const allErrors = FIELD_ORDER.map((name) => {
    const message = name === "cv" ? cvError : (errors as Record<string, { message?: string } | undefined>)[name]?.message;
    return message ? { name, message } : null;
  }).filter((entry): entry is { name: FieldName; message: string } => entry !== null);
  const showSummary = summaryKey > 0 && allErrors.length > 0;

  // Move focus to the error summary after a failed submit.
  useEffect(() => {
    if (summaryKey > 0) summaryRef.current?.focus();
  }, [summaryKey]);

  useEffect(() => {
    if (phase.kind === "done") successRef.current?.focus();
  }, [phase.kind]);

  function chooseFile(next: File | null) {
    setFile(next);
    setCvError(next ? cvProblem(next) : null);
  }

  function checkCv(): boolean {
    const problem = file ? cvProblem(file) : "Attach your CV";
    setCvError(problem);
    return !problem;
  }

  const onValid = (values: ApplicationFields) => {
    if (!checkCv()) {
      setSummaryKey((key) => key + 1);
      return;
    }
    if (sending.current) return; // ignore double submits
    sending.current = true;
    setPhase({ kind: "sending", progress: 0 });

    const body = new FormData();
    body.set("fullName", values.fullName);
    body.set("email", values.email);
    body.set("phone", values.phone);
    if (values.message) body.set("message", values.message);
    body.set("consent", values.consent ? "true" : "false");
    if (vacancyId) body.set("vacancyId", vacancyId);
    if (values.areaOfInterest) body.set("areaOfInterest", values.areaOfInterest);
    body.set(APPLICATION_HONEYPOT_FIELD, values[APPLICATION_HONEYPOT_FIELD] ?? "");
    body.set("cv", file!, file!.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/public/applications");
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setPhase({ kind: "sending", progress: Math.round((event.loaded / event.total) * 100) });
    };
    xhr.onload = () => {
      sending.current = false;
      if (xhr.status === 201 || xhr.status === 202) {
        setPhase({ kind: "done" });
        return;
      }
      const response = (xhr.response ?? {}) as { error?: { message?: string; details?: Record<string, string | string[]> } };
      const details = response.error?.details ?? {};
      let fieldErrors = 0;
      for (const [name, value] of Object.entries(details)) {
        const message = Array.isArray(value) ? value[0] : value;
        if (!message) continue;
        if (name === "cv") {
          setCvError(message);
          fieldErrors++;
        } else if ((FIELD_ORDER as string[]).includes(name)) {
          setError(name as Exclude<FieldName, "cv">, { type: "server", message });
          fieldErrors++;
        }
      }
      const fallback =
        xhr.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : xhr.status === 413
            ? "Your CV is too large. The maximum size is 5 MB."
            : "We could not send your application. Please try again.";
      setPhase({ kind: "error", message: response.error?.message ?? fallback });
      if (fieldErrors) setSummaryKey((key) => key + 1);
    };
    xhr.onerror = () => {
      sending.current = false;
      setPhase({ kind: "error", message: "The connection was lost while sending. Check your connection and try again. Your details and file are kept." });
    };
    xhr.send(body);
  };

  const onInvalid = () => {
    checkCv();
    setSummaryKey((key) => key + 1);
  };

  if (phase.kind === "done") {
    return (
      <div className="application-success" role="status" aria-live="polite" data-testid="state-application-success">
        <CheckCircle2 aria-hidden="true" size={32} className="application-success-icon" />
        <h2 ref={successRef} tabIndex={-1} className="display application-success-title">
          {successTitle}
        </h2>
        <p className="application-success-text">
          We received your application for <strong>{positionLabel}</strong>.
        </p>
        <Link href="/careers" className="link-arrow focus-ring" data-testid="link-application-back-to-careers">
          Back to careers <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    );
  }

  const describe = (name: FieldName, extra?: string) =>
    [allErrors.some((e) => e.name === name) ? errorId(name) : null, extra].filter(Boolean).join(" ") || undefined;
  const invalid = (name: FieldName) => (allErrors.some((e) => e.name === name) ? true : undefined);
  const fieldError = (name: FieldName) => {
    const entry = allErrors.find((e) => e.name === name);
    return entry ? (
      <p id={errorId(name)} className="form-error">
        {entry.message}
      </p>
    ) : null;
  };
  const isSending = phase.kind === "sending";

  return (
    <form
      className="application-form"
      noValidate
      onSubmit={(event) => void handleSubmit(onValid, onInvalid)(event)}
      aria-describedby={`${id}-required-note`}
      data-testid="form-application"
    >
      {showSummary ? (
        <div ref={summaryRef} tabIndex={-1} className="form-error-summary" role="alert" aria-labelledby={`${id}-summary-title`} data-testid="summary-application-errors">
          <h2 id={`${id}-summary-title`} className="form-error-summary-title">
            There {allErrors.length === 1 ? "is a problem" : `are ${allErrors.length} problems`} with your application
          </h2>
          <ul>
            {allErrors.map((entry) => (
              <li key={entry.name}>
                <a href={`#${fieldId(entry.name)}`}>
                  {FIELD_LABELS[entry.name]}: {entry.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p id={`${id}-required-note`} className="form-note">
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor={fieldId("fullName")} className="form-label">
            Full name <span className="form-required">* <span className="sr-only">(required)</span></span>
          </label>
          <input
            id={fieldId("fullName")}
            className="form-input focus-ring"
            autoComplete="name"
            aria-invalid={invalid("fullName")}
            aria-describedby={describe("fullName")}
            aria-required="true"
            {...register("fullName")}
            data-testid="input-application-full-name"
          />
          {fieldError("fullName")}
        </div>

        <div className="form-field">
          <label htmlFor={fieldId("email")} className="form-label">
            Email <span className="form-required">* <span className="sr-only">(required)</span></span>
          </label>
          <input
            id={fieldId("email")}
            type="email"
            className="form-input focus-ring"
            autoComplete="email"
            inputMode="email"
            aria-invalid={invalid("email")}
            aria-describedby={describe("email")}
            aria-required="true"
            {...register("email")}
            data-testid="input-application-email"
          />
          {fieldError("email")}
        </div>

        <div className="form-field">
          <label htmlFor={fieldId("phone")} className="form-label">
            Phone <span className="form-required">* <span className="sr-only">(required)</span></span>
          </label>
          <input
            id={fieldId("phone")}
            type="tel"
            className="form-input focus-ring"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={invalid("phone")}
            aria-describedby={describe("phone", `${id}-phone-hint`)}
            aria-required="true"
            {...register("phone")}
            data-testid="input-application-phone"
          />
          <p id={`${id}-phone-hint`} className="form-hint">
            For example +234 803 123 4567 or 0803 123 4567.
          </p>
          {fieldError("phone")}
        </div>

        <div className="form-field">
          <label htmlFor={fieldId("position")} className="form-label">
            Position applied for
          </label>
          <input id={fieldId("position")} className="form-input form-input--readonly" value={positionLabel} readOnly data-testid="input-application-position" />
        </div>

        {areasOfInterest?.length ? (
          <div className="form-field form-field--wide">
            <label htmlFor={fieldId("areaOfInterest")} className="form-label">
              Area of interest <span className="form-optional">(optional)</span>
            </label>
            <select
              id={fieldId("areaOfInterest")}
              className="form-input form-select focus-ring"
              aria-invalid={invalid("areaOfInterest")}
              aria-describedby={describe("areaOfInterest")}
              {...register("areaOfInterest")}
              data-testid="select-application-area"
            >
              <option value="">Choose an area</option>
              {areasOfInterest.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            {fieldError("areaOfInterest")}
          </div>
        ) : null}

        <div className="form-field form-field--wide">
          <label htmlFor={fieldId("message")} className="form-label">
            Cover letter or additional message <span className="form-optional">(optional)</span>
          </label>
          <textarea
            id={fieldId("message")}
            className="form-input form-textarea focus-ring"
            rows={6}
            maxLength={APPLICATION_MESSAGE_MAX}
            aria-invalid={invalid("message")}
            aria-describedby={describe("message", `${id}-message-count`)}
            {...register("message")}
            data-testid="textarea-application-message"
          />
          <p id={`${id}-message-count`} className={cn("form-hint form-counter", messageLength > APPLICATION_MESSAGE_MAX - 100 && "is-near")}>
            {messageLength} of {APPLICATION_MESSAGE_MAX} characters
          </p>
          {fieldError("message")}
        </div>

        <div className="form-field form-field--wide">
          <span className="form-label" id={`${id}-cv-label`}>
            CV <span className="form-required">* <span className="sr-only">(required)</span></span>
          </span>
          <div
            className={cn("cv-drop", dragging && "is-dragging", file && "has-file", cvError && "is-invalid")}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseFile(event.dataTransfer.files?.[0] ?? null);
            }}
            data-testid="dropzone-application-cv"
          >
            {/* One tab stop: the real file input, visually hidden; its label is the "Choose file" button. */}
            <input
              ref={fileInput}
              id={fieldId("cv")}
              type="file"
              accept={CV_ACCEPT}
              className="cv-input"
              aria-labelledby={`${id}-cv-label ${id}-cv-choose`}
              aria-describedby={[cvError ? errorId("cv") : null, `${id}-cv-hint`].filter(Boolean).join(" ")}
              aria-invalid={cvError ? true : undefined}
              aria-required="true"
              onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
              data-testid="input-application-cv"
            />
            {file ? (
              <div className="cv-file">
                <FileText aria-hidden="true" size={22} />
                <span className="cv-file-name">{file.name}</span>
                <span className="cv-file-size">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  className="cv-remove focus-ring"
                  onClick={() => {
                    chooseFile(null);
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                  data-testid="button-application-cv-remove"
                >
                  <X aria-hidden="true" size={16} /> Remove<span className="sr-only"> {file.name}</span>
                </button>
              </div>
            ) : (
              <div className="cv-prompt">
                <Upload aria-hidden="true" size={22} />
                <span>Drag your CV here, or</span>
              </div>
            )}
            <label htmlFor={fieldId("cv")} id={`${id}-cv-choose`} className="cv-choose">
              {file ? "Choose a different file" : "Choose file"}
            </label>
          </div>
          <p id={`${id}-cv-hint`} className="form-hint">
            PDF, DOC or DOCX, up to 5 MB.
          </p>
          {fieldError("cv")}
        </div>

        <div className="form-field form-field--wide">
          <div className="form-check">
            <input
              id={fieldId("consent")}
              type="checkbox"
              className="form-checkbox focus-ring"
              aria-invalid={invalid("consent")}
              aria-describedby={describe("consent")}
              aria-required="true"
              {...register("consent")}
              data-testid="checkbox-application-consent"
            />
            <label htmlFor={fieldId("consent")} className="form-check-label">
              {consentText} <span className="form-required">* <span className="sr-only">(required)</span></span>
            </label>
          </div>
          {fieldError("consent")}
        </div>
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor={fieldId("website")}>Website</label>
        <input id={fieldId("website")} tabIndex={-1} autoComplete="off" {...register(APPLICATION_HONEYPOT_FIELD)} />
      </div>

      {phase.kind === "error" ? (
        <div className="form-alert" role="alert" data-testid="alert-application-error">
          <p>{phase.message}</p>
          <p className="form-alert-hint">Your details{file ? " and your CV" : ""} are still here. Check them and send again.</p>
        </div>
      ) : null}

      {isSending ? (
        <div className="upload-progress">
          <span className="upload-progress-label" id={`${id}-progress-label`}>
            Uploading your application
          </span>
          <div
            className="upload-progress-track"
            role="progressbar"
            aria-labelledby={`${id}-progress-label`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={phase.progress}
            data-testid="progress-application-upload"
          >
            <span className="upload-progress-fill" style={{ width: `${phase.progress}%` }} />
          </div>
        </div>
      ) : null}

      <div className="form-actions">
        <button type="submit" className="button-primary focus-ring" aria-disabled={isSending || undefined} data-testid="button-application-submit">
          <span>{isSending ? "Sending..." : phase.kind === "error" ? "Try again" : "Send application"}</span>
          <ArrowRight aria-hidden="true" className="button-icon" />
        </button>
      </div>
    </form>
  );
}
