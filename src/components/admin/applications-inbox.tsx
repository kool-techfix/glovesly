"use client";

import { ArrowLeft, Download, FileText, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog, EmptyState, ListStatus, PageHeading, StatusBadge } from "@/components/admin/admin-parts";
import { useAdmin } from "@/lib/admin/admin-store";
import { api, errorMessage } from "@/lib/admin/api-client";
import { formatDateTime, relativeTime } from "@/lib/admin/format";
import { useAdminList } from "@/lib/admin/use-admin-list";
import { formatBytes } from "@/lib/careers/cv-rules";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { JobApplicationDto } from "@/Services/job-application.service";

/*
 * Job applications inbox (the Messages inbox pattern). Opening a NEW
 * application marks it Reviewed. The CV opens through
 * /api/admin/applications/[id]/cv, which redirects to a 10-minute signed
 * link and logs the view. Delete is ADMIN only and removes the CV too.
 */
export function ApplicationsInbox({ initialId }: { initialId?: string }) {
  const { refreshSummary, isAdmin } = useAdmin();
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [positions, setPositions] = useState<Array<{ id: string; title: string }>>([]);
  const list = useAdminList<JobApplicationDto>("/api/admin/applications", { filters: { vacancyId: vacancyFilter || undefined } });
  const [selected, setSelected] = useState<JobApplicationDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<Array<{ id: string; title: string }>>("/api/admin/applications/positions")
      .then((rows) => {
        if (!cancelled) setPositions(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Deep link from the alert email: /admin/applications?id=…
  useEffect(() => {
    if (!initialId) return;
    let cancelled = false;
    api<JobApplicationDto>(`/api/admin/applications/${encodeURIComponent(initialId)}`)
      .then((application) => {
        if (!cancelled) void open(application);
      })
      .catch((error: unknown) => toast.error(errorMessage(error)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the deep link
  }, [initialId]);

  async function setStatus(application: JobApplicationDto, status: ApplicationStatus, announce = true) {
    try {
      const updated = await api<JobApplicationDto>(`/api/admin/applications/${application.id}`, { method: "PATCH", body: { status } });
      if (list.status && list.status !== updated.status) list.removeItem(updated.id);
      else list.replaceItem(updated);
      setSelected((current) => (current?.id === updated.id ? updated : current));
      void refreshSummary();
      if (announce) toast.success(`Marked as ${APPLICATION_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function open(application: JobApplicationDto) {
    setSelected(application);
    if (application.status === "NEW") await setStatus(application, "REVIEWED", false);
  }

  async function remove() {
    if (!selected) return;
    try {
      await api(`/api/admin/applications/${selected.id}`, { method: "DELETE" });
      list.removeItem(selected.id);
      setSelected(null);
      setDeleting(false);
      toast.success("Application and CV deleted.");
      void refreshSummary();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <div className="adm-screen">
      <PageHeading title="Applications" description="Job applications from the Careers pages. CVs are stored privately." />

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search aria-hidden size={16} />
          <label htmlFor="applications-search" className="adm-visually-hidden">
            Search applications by name or email
          </label>
          <input
            id="applications-search"
            type="search"
            className="adm-input"
            placeholder="Search name or email"
            value={list.searchInput}
            onChange={(event) => list.setSearchInput(event.target.value)}
            data-testid="input-applications-search"
          />
        </div>
        <label htmlFor="applications-vacancy" className="adm-visually-hidden">
          Filter by position
        </label>
        <select
          id="applications-vacancy"
          className="adm-input adm-select adm-toolbar-select"
          value={vacancyFilter}
          onChange={(event) => setVacancyFilter(event.target.value)}
          data-testid="select-applications-vacancy"
        >
          <option value="">All positions</option>
          <option value="general">General applications</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.title}
            </option>
          ))}
        </select>
        <div className="adm-segmented" role="group" aria-label="Filter by status">
          {[{ value: "", label: "All" }, ...APPLICATION_STATUSES.map((s) => ({ value: s, label: APPLICATION_STATUS_LABELS[s] }))].map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              className="adm-segment"
              aria-pressed={list.status === filter.value}
              onClick={() => list.setStatus(filter.value)}
              data-testid={`button-applications-filter-${(filter.value || "all").toLowerCase()}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("adm-inbox", selected && "has-selection")}>
        <div className="adm-inbox-list">
          {!list.loading && !list.error && list.items.length === 0 ? (
            <EmptyState title="No applications here." description="Applications sent from the Careers pages will appear in this list." />
          ) : (
            <ul className="adm-message-list" data-testid="list-applications">
              {list.items.map((application) => (
                <li key={application.id}>
                  <button
                    type="button"
                    className={cn("adm-message-item", application.status === "NEW" && "is-unread")}
                    aria-current={selected?.id === application.id ? "true" : undefined}
                    onClick={() => void open(application)}
                    data-testid={`button-applications-open-${application.id}`}
                  >
                    <span className="adm-message-from">
                      <FileText aria-hidden size={14} />
                      {application.fullName}
                      {application.status === "NEW" ? <span className="adm-visually-hidden"> (new)</span> : null}
                    </span>
                    <span className="adm-message-subject">
                      {application.positionLabel} · {APPLICATION_STATUS_LABELS[application.status]}
                    </span>
                    <span className="adm-message-time">{relativeTime(application.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ListStatus
            area="applications"
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

        <section className="adm-inbox-detail adm-card" aria-label="Application" data-testid="panel-applications-detail">
          {selected ? (
            <>
              <button
                type="button"
                className="adm-button adm-button--ghost adm-button--sm adm-inbox-back"
                onClick={() => setSelected(null)}
                data-testid="button-applications-back"
              >
                <ArrowLeft aria-hidden size={16} /> All applications
              </button>
              <header className="adm-message-header">
                <h2 className="adm-section-title">{selected.fullName}</h2>
                <StatusBadge status={selected.status} label={APPLICATION_STATUS_LABELS[selected.status]} />
              </header>
              <dl className="adm-meta-list">
                <div>
                  <dt>Position</dt>
                  <dd>
                    {selected.vacancy ? (
                      <a href={`/admin/vacancies`} className="adm-link" data-testid="link-applications-vacancy">
                        {selected.positionLabel}
                      </a>
                    ) : (
                      selected.positionLabel
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${selected.email}`} className="adm-link" data-testid="link-applications-email">
                      {selected.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${selected.phone}`} className="adm-link" data-testid="link-applications-phone">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Received</dt>
                  <dd>{formatDateTime(selected.createdAt)}</dd>
                </div>
                <div>
                  <dt>Consent</dt>
                  <dd>{selected.consent ? "Agreed to recruitment processing" : "Not given"}</dd>
                </div>
                <div>
                  <dt>CV</dt>
                  <dd>
                    {selected.cvFilename} ({formatBytes(selected.cvBytes)})
                  </dd>
                </div>
              </dl>
              {selected.message ? <div className="adm-message-body">{selected.message}</div> : <p className="adm-muted">No message.</p>}

              <div className="adm-form-actions adm-form-actions--start">
                <a
                  href={`/api/admin/applications/${selected.id}/cv`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-button adm-button--primary adm-button--sm"
                  data-testid="link-applications-cv"
                >
                  <Download aria-hidden size={16} /> Download CV
                </a>
                <div className="adm-inline-field">
                  <label htmlFor="application-status" className="adm-label">
                    Status
                  </label>
                  <select
                    id="application-status"
                    className="adm-input adm-select"
                    value={selected.status}
                    onChange={(event) => void setStatus(selected, event.target.value as ApplicationStatus)}
                    data-testid="select-applications-status"
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {APPLICATION_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
                {isAdmin ? (
                  <button
                    type="button"
                    className="adm-button adm-button--danger-ghost adm-button--sm"
                    onClick={() => setDeleting(true)}
                    data-testid="button-applications-delete"
                  >
                    <Trash2 aria-hidden size={16} /> Delete
                  </button>
                ) : null}
              </div>
              <p className="adm-field-help">The CV link is valid for 10 minutes and each download is recorded in the activity log.</p>
            </>
          ) : (
            <p className="adm-muted adm-inbox-placeholder">Choose an application to see it.</p>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={deleting}
        title="Delete this application?"
        message={<p>The application and its CV will be removed permanently. Changing the status to Archived keeps them instead.</p>}
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
        onClose={() => setDeleting(false)}
        testId="dialog-applications-delete"
      />
    </div>
  );
}
