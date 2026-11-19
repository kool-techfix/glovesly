"use client";

import { Archive, ArrowLeft, Inbox, Mail, MailOpen, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog, EmptyState, ListStatus, MESSAGE_STATUS_LABELS, PageHeading, StatusBadge } from "@/components/admin/admin-parts";
import { useAdmin } from "@/lib/admin/admin-store";
import { api, errorMessage } from "@/lib/admin/api-client";
import { formatDateTime, relativeTime } from "@/lib/admin/format";
import { useAdminList } from "@/lib/admin/use-admin-list";
import { MESSAGE_STATUSES, type MessageStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { ContactMessageDto } from "@/Services/contact.service";

export function MessagesInbox({ initialId }: { initialId?: string }) {
  const { refreshSummary } = useAdmin();
  const list = useAdminList<ContactMessageDto>("/api/admin/messages");
  const [selected, setSelected] = useState<ContactMessageDto | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Deep link from the alert email: /admin/messages?id=…
  useEffect(() => {
    if (!initialId) return;
    let cancelled = false;
    api<ContactMessageDto>(`/api/admin/messages/${encodeURIComponent(initialId)}`)
      .then((message) => {
        if (!cancelled) void open(message);
      })
      .catch((error: unknown) => toast.error(errorMessage(error)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the deep link
  }, [initialId]);

  async function update(message: ContactMessageDto, body: { status?: MessageStatus; replyDraft?: string | null }) {
    const updated = await api<ContactMessageDto>(`/api/admin/messages/${message.id}`, { method: "PATCH", body });
    if (list.status && list.status !== updated.status) list.removeItem(updated.id);
    else list.replaceItem(updated);
    setSelected((current) => (current?.id === updated.id ? updated : current));
    void refreshSummary();
    return updated;
  }

  async function open(message: ContactMessageDto) {
    setSelected(message);
    setDraft(message.replyDraft ?? "");
    if (message.status === "NEW") {
      try {
        await update(message, { status: "READ" });
      } catch (error) {
        toast.error(errorMessage(error));
      }
    }
  }

  async function setStatus(status: MessageStatus) {
    if (!selected) return;
    try {
      await update(selected, { status });
      toast.success(`Marked as ${MESSAGE_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function saveDraft() {
    if (!selected) return;
    setSaving(true);
    try {
      await update(selected, { replyDraft: draft });
      toast.success("Reply draft saved.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected) return;
    try {
      await api(`/api/admin/messages/${selected.id}`, { method: "DELETE" });
      list.removeItem(selected.id);
      setSelected(null);
      setDeleting(false);
      toast.success("Message deleted.");
      void refreshSummary();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  const mailto = selected
    ? `mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject ?? "Your message to Glovesly Pro-Project"}`)}&body=${encodeURIComponent(draft)}`
    : "";

  return (
    <div className="adm-screen">
      <PageHeading title="Messages" description="Messages sent through the contact form." />

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search aria-hidden size={16} />
          <label htmlFor="messages-search" className="adm-visually-hidden">
            Search messages
          </label>
          <input
            id="messages-search"
            type="search"
            className="adm-input"
            placeholder="Search messages"
            value={list.searchInput}
            onChange={(event) => list.setSearchInput(event.target.value)}
            data-testid="input-messages-search"
          />
        </div>
        <div className="adm-segmented" role="group" aria-label="Filter by status">
          {[{ value: "", label: "All" }, ...MESSAGE_STATUSES.map((s) => ({ value: s, label: MESSAGE_STATUS_LABELS[s] }))].map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              className="adm-segment"
              aria-pressed={list.status === filter.value}
              onClick={() => list.setStatus(filter.value)}
              data-testid={`button-messages-filter-${(filter.value || "all").toLowerCase()}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("adm-inbox", selected && "has-selection")}>
        <div className="adm-inbox-list">
          {!list.loading && !list.error && list.items.length === 0 ? (
            <EmptyState title="No messages here." description="New contact form messages will appear in this list." />
          ) : (
            <ul className="adm-message-list" data-testid="list-messages">
              {list.items.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    className={cn("adm-message-item", message.status === "NEW" && "is-unread")}
                    aria-current={selected?.id === message.id ? "true" : undefined}
                    onClick={() => void open(message)}
                    data-testid={`button-messages-open-${message.id}`}
                  >
                    <span className="adm-message-from">
                      {message.status === "NEW" ? <Mail aria-hidden size={14} /> : <MailOpen aria-hidden size={14} />}
                      {message.name}
                      {message.status === "NEW" ? <span className="adm-visually-hidden"> (unread)</span> : null}
                    </span>
                    <span className="adm-message-subject">{message.subject ?? message.message.slice(0, 80)}</span>
                    <span className="adm-message-time">{relativeTime(message.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ListStatus
            area="messages"
            loading={list.loading}
            error={list.error}
            hasMore={list.hasMore}
            loadingMore={list.loadingMore}
            onLoadMore={list.loadMore}
            onRetry={list.reload}
            shown={list.items.length}
            total={list.total}
          />
        </div>

        <section className="adm-inbox-detail adm-card" aria-label="Message" data-testid="panel-messages-detail">
          {selected ? (
            <>
              <button
                type="button"
                className="adm-button adm-button--ghost adm-button--sm adm-inbox-back"
                onClick={() => setSelected(null)}
                data-testid="button-messages-back"
              >
                <ArrowLeft aria-hidden size={16} /> All messages
              </button>
              <header className="adm-message-header">
                <h2 className="adm-section-title">{selected.subject ?? "No subject"}</h2>
                <StatusBadge status={selected.status} />
              </header>
              <dl className="adm-meta-list">
                <div>
                  <dt>From</dt>
                  <dd>
                    {selected.name} &lt;
                    <a href={`mailto:${selected.email}`} className="adm-link" data-testid="link-messages-email">
                      {selected.email}
                    </a>
                    &gt;
                  </dd>
                </div>
                {selected.phone ? (
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${selected.phone}`} className="adm-link" data-testid="link-messages-phone">
                        {selected.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {selected.company ? (
                  <div>
                    <dt>Company</dt>
                    <dd>{selected.company}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Received</dt>
                  <dd>{formatDateTime(selected.createdAt)}</dd>
                </div>
              </dl>
              <div className="adm-message-body">{selected.message}</div>

              <div className="adm-field adm-field--wide">
                <label htmlFor="message-reply" className="adm-label">
                  Reply draft
                </label>
                <textarea
                  id="message-reply"
                  className="adm-input adm-textarea"
                  rows={6}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  data-testid="textarea-messages-reply"
                />
                <p className="adm-field-help">Drafts are saved here only. Use &ldquo;Reply by email&rdquo; to send.</p>
              </div>

              <div className="adm-form-actions adm-form-actions--start">
                <button
                  type="button"
                  className="adm-button adm-button--secondary adm-button--sm"
                  onClick={saveDraft}
                  disabled={saving || draft === (selected.replyDraft ?? "")}
                  data-testid="button-messages-save-draft"
                >
                  Save draft
                </button>
                <a href={mailto} className="adm-button adm-button--primary adm-button--sm" data-testid="link-messages-reply">
                  <Mail aria-hidden size={16} /> Reply by email
                </a>
                {selected.status !== "ARCHIVED" ? (
                  <button
                    type="button"
                    className="adm-button adm-button--ghost adm-button--sm"
                    onClick={() => setStatus("ARCHIVED")}
                    data-testid="button-messages-archive"
                  >
                    <Archive aria-hidden size={16} /> Archive
                  </button>
                ) : (
                  <button
                    type="button"
                    className="adm-button adm-button--ghost adm-button--sm"
                    onClick={() => setStatus("READ")}
                    data-testid="button-messages-unarchive"
                  >
                    <Inbox aria-hidden size={16} /> Move to inbox
                  </button>
                )}
                <button
                  type="button"
                  className="adm-button adm-button--ghost adm-button--sm"
                  onClick={() => setStatus("NEW")}
                  disabled={selected.status === "NEW"}
                  data-testid="button-messages-mark-unread"
                >
                  <Mail aria-hidden size={16} /> Mark unread
                </button>
                <button
                  type="button"
                  className="adm-button adm-button--danger-ghost adm-button--sm"
                  onClick={() => setDeleting(true)}
                  data-testid="button-messages-delete"
                >
                  <Trash2 aria-hidden size={16} /> Delete
                </button>
              </div>
            </>
          ) : (
            <p className="adm-muted adm-inbox-placeholder">Choose a message to read it.</p>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={deleting}
        title="Delete this message?"
        message={<p>The message will be removed permanently. Archiving keeps it instead.</p>}
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
        onClose={() => setDeleting(false)}
        testId="dialog-messages-delete"
      />
    </div>
  );
}
