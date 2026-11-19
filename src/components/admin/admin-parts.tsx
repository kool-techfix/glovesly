"use client";

import { AlertTriangle, Inbox, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { ContentStatus, MessageStatus } from "@/lib/domain";
import { formatDateTime, relativeTime } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/* Small building blocks shared by every admin screen. */

/**
 * "3 minutes ago" with the exact time as a tooltip. The text legitimately
 * differs between the server render and hydration, so that mismatch is ignored.
 */
export function TimeAgo({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={formatDateTime(iso)} suppressHydrationWarning>
      {relativeTime(iso)}
    </time>
  );
}

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="adm-page-heading">
      <div>
        <h1 className="adm-page-title">{title}</h1>
        {description ? <p className="adm-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="adm-page-actions">{actions}</div> : null}
    </div>
  );
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "In review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  NEW: "New",
  READ: "Read",
  ARCHIVED: "Archived",
};

const BADGE_TONE: Record<string, string> = {
  DRAFT: "neutral",
  REVIEW: "warning",
  PUBLISHED: "success",
  ARCHIVED: "muted",
  NEW: "info",
  READ: "neutral",
  ACTIVE: "success",
  DISABLED: "muted",
  ADMIN: "info",
  EDITOR: "neutral",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "muted";
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("adm-badge", `adm-badge--${tone}`, className)}>{children}</span>;
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = (BADGE_TONE[status] ?? "neutral") as Parameters<typeof Badge>[0]["tone"];
  const text =
    label ??
    CONTENT_STATUS_LABELS[status as ContentStatus] ??
    MESSAGE_STATUS_LABELS[status as MessageStatus] ??
    status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge tone={tone}>{text}</Badge>;
}

export function FlagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="adm-flag">
      <AlertTriangle aria-hidden size={13} />
      {children}
    </span>
  );
}

export function Notice({
  tone = "warning",
  children,
  testId,
}: {
  tone?: "warning" | "info" | "danger";
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div className={cn("adm-notice", `adm-notice--${tone}`)} role="status" data-testid={testId}>
      <AlertTriangle aria-hidden size={18} />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="adm-empty">
      <Inbox aria-hidden size={28} />
      <p className="adm-empty-title">{title}</p>
      {description ? <p className="adm-empty-description">{description}</p> : null}
      {action}
    </div>
  );
}

/** Loading, error and "load more" footer for a server-paged list. */
export function ListStatus({
  loading,
  error,
  hasMore,
  loadingMore,
  onLoadMore,
  onRetry,
  shown,
  total,
  area,
}: {
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  shown: number;
  total: number;
  area: string;
}) {
  if (loading) {
    return (
      <p className="adm-list-status" role="status">
        <Loader2 aria-hidden size={16} className="adm-spin" /> Loading…
      </p>
    );
  }
  if (error) {
    return (
      <div className="adm-list-status adm-list-status--error" role="alert">
        <span>{error}</span>
        <button type="button" className="adm-button adm-button--ghost adm-button--sm" onClick={onRetry} data-testid={`button-${area}-retry`}>
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="adm-list-status">
      {total > 0 ? (
        <span>
          Showing {shown} of {total}
        </span>
      ) : null}
      {hasMore ? (
        <button
          type="button"
          className="adm-button adm-button--secondary adm-button--sm"
          onClick={onLoadMore}
          disabled={loadingMore}
          data-testid={`button-${area}-load-more`}
        >
          {loadingMore ? <Loader2 aria-hidden size={14} className="adm-spin" /> : null}
          Load more
        </button>
      ) : null}
    </div>
  );
}

/** Modal built on the native <dialog> element (focus trapping and Escape for free). */
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  testId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  testId: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn("adm-dialog", `adm-dialog--${size}`)}
      aria-labelledby={titleId}
      onClose={onClose}
      data-testid={testId}
    >
      {open ? (
        <div className="adm-dialog-inner">
          <header className="adm-dialog-header">
            <div>
              <h2 id={titleId} className="adm-dialog-title">
                {title}
              </h2>
              {description ? <div className="adm-dialog-description">{description}</div> : null}
            </div>
            <button
              type="button"
              className="adm-icon-button"
              onClick={onClose}
              aria-label="Close"
              data-testid={`button-${testId}-close`}
            >
              <X aria-hidden size={18} />
            </button>
          </header>
          <div className="adm-dialog-body">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive,
  onConfirm,
  onClose,
  testId,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  testId: string;
}) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm" testId={testId}>
      <div className="adm-confirm-message">{message}</div>
      <div className="adm-form-actions">
        <button type="button" className="adm-button adm-button--ghost" onClick={onClose} data-testid={`button-${testId}-cancel`}>
          Cancel
        </button>
        <button
          type="button"
          className={cn("adm-button", destructive ? "adm-button--danger" : "adm-button--primary")}
          onClick={confirm}
          disabled={busy}
          data-testid={`button-${testId}-confirm`}
        >
          {busy ? <Loader2 aria-hidden size={16} className="adm-spin" /> : null}
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

/** Label + control + help/error, wired with aria-describedby. */
export function FieldShell({
  id,
  label,
  required,
  help,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("adm-field", wide && "adm-field--wide", error && "adm-field--invalid")}>
      <label htmlFor={id} className="adm-label">
        {label}
        {required ? (
          <span className="adm-required" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="adm-field-error" role="alert">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="adm-field-help">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string, help?: string) {
  return error ? `${id}-error` : help ? `${id}-help` : undefined;
}
