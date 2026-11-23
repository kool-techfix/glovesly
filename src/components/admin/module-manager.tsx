"use client";

import { ExternalLink, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  ConfirmDialog,
  CONTENT_STATUS_LABELS,
  Dialog,
  EmptyState,
  FlagBadge,
  ListStatus,
  Notice,
  PageHeading,
  StatusBadge,
} from "@/components/admin/admin-parts";
import { FieldsForm } from "@/components/admin/fields-form";
import { moduleConfigs, type AdminItem, type ModuleKey } from "@/components/admin/module-configs";
import { useAdmin } from "@/lib/admin/admin-store";
import { api, errorMessage } from "@/lib/admin/api-client";
import { plural, relativeTime } from "@/lib/admin/format";
import { useAdminList } from "@/lib/admin/use-admin-list";
import { CONTENT_STATUSES, STATUS_TRANSITIONS, type ContentStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

/* Generic list / search / filter / CRUD / status screen for any ModuleConfig. */

function transitionLabel(from: ContentStatus, to: ContentStatus): string {
  if (to === "REVIEW") return "Send for review";
  if (to === "PUBLISHED") return from === "ARCHIVED" ? "Republish" : "Publish";
  if (to === "ARCHIVED") return "Archive";
  return from === "PUBLISHED" ? "Unpublish" : "Back to draft";
}

export function ModuleManager({ moduleKey }: { moduleKey: ModuleKey }) {
  const config = moduleConfigs[moduleKey];
  const area = config.key;
  const { summary, refreshSummary } = useAdmin();
  const list = useAdminList<AdminItem>(config.apiPath);
  const [editing, setEditing] = useState<AdminItem | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = summary.modules[config.key];
  const totalAll = CONTENT_STATUSES.reduce((sum, status) => sum + counts[status], 0);
  const flaggedTotal = config.key === "projects" ? summary.projectsWithoutState : list.items.filter((item) => config.flag?.(item)).length;

  const title = (item: AdminItem) => String(item[config.titleKey] ?? "Untitled");

  async function save(payload: Record<string, unknown>) {
    if (editing === "new") {
      await api<AdminItem>(config.apiPath, { method: "POST", body: payload });
      toast.success(`Created ${config.singular} as a draft.`);
      list.reload();
    } else if (editing) {
      const updated = await api<AdminItem>(`${config.apiPath}/${editing.id}`, { method: "PATCH", body: payload });
      list.replaceItem(updated);
      toast.success("Changes saved.");
    }
    setEditing(null);
    void refreshSummary();
  }

  async function changeStatus(item: AdminItem, status: ContentStatus) {
    setBusyId(item.id);
    try {
      const updated = await api<AdminItem>(`${config.apiPath}/${item.id}/status`, { method: "POST", body: { status } });
      if (list.status && list.status !== updated.status) list.removeItem(item.id);
      else list.replaceItem(updated);
      toast.success(`"${title(item)}" is now ${CONTENT_STATUS_LABELS[status].toLowerCase()}.`);
      void refreshSummary();
    } catch (error) {
      toast.error(errorMessage(error), { duration: 8000 });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: AdminItem) {
    try {
      await api(`${config.apiPath}/${item.id}`, { method: "DELETE" });
      list.removeItem(item.id);
      toast.success(`Deleted "${title(item)}".`);
      setDeleting(null);
      void refreshSummary();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  const filters: Array<{ value: string; label: string; count: number }> = [
    { value: "", label: "All", count: totalAll },
    ...CONTENT_STATUSES.map((status) => ({ value: status, label: CONTENT_STATUS_LABELS[status], count: counts[status] })),
  ];

  return (
    <div className="adm-screen">
      <PageHeading
        title={config.label}
        description={config.description}
        actions={
          <button
            type="button"
            className="adm-button adm-button--primary"
            onClick={() => setEditing("new")}
            data-testid={`button-${area}-new`}
          >
            <Plus aria-hidden size={18} /> New {config.singular}
          </button>
        }
      />

      {flaggedTotal > 0 ? (
        <Notice testId={`notice-${area}-flagged`}>
          {config.key === "projects" ? (
            <>
              <strong>{plural(flaggedTotal, "project")} without a state.</strong> They cannot be published or placed on
              the Nigeria map until a state is chosen. They are marked below.
            </>
          ) : (
            <>{plural(flaggedTotal, "item")} need attention. They are marked below.</>
          )}
        </Notice>
      ) : null}

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search aria-hidden size={16} />
          <label htmlFor={`${area}-search`} className="adm-visually-hidden">
            Search {config.label.toLowerCase()}
          </label>
          <input
            id={`${area}-search`}
            type="search"
            className="adm-input"
            placeholder={`Search ${config.label.toLowerCase()}`}
            value={list.searchInput}
            onChange={(event) => list.setSearchInput(event.target.value)}
            data-testid={`input-${area}-search`}
          />
        </div>
        <div className="adm-segmented" role="group" aria-label="Filter by status">
          {filters.map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              className="adm-segment"
              aria-pressed={list.status === filter.value}
              onClick={() => list.setStatus(filter.value)}
              data-testid={`button-${area}-filter-${(filter.value || "all").toLowerCase()}`}
            >
              {filter.label}
              <span className="adm-segment-count">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {!list.loading && !list.error && list.items.length === 0 ? (
        <EmptyState
          title={list.searchInput || list.status ? "Nothing matches these filters." : `No ${config.label.toLowerCase()} yet.`}
          description={list.searchInput || list.status ? "Try another search or status." : `Create the first ${config.singular}.`}
        />
      ) : (
        <ul className="adm-rows" aria-busy={list.loading} data-testid={`list-${area}`}>
          {list.items.map((item) => {
            const flag = config.flag?.(item) ?? null;
            const image = config.imageKey ? (item[config.imageKey] as string | null) : null;
            const publicPath = item.status === "PUBLISHED" ? config.publicPath?.(item) : null;
            const busy = busyId === item.id;
            return (
              <li key={item.id} className={cn("adm-row", flag && "adm-row--flagged")} data-testid={`row-${area}-${item.slug}`}>
                {config.imageKey ? (
                  <div className={cn("adm-thumb", !image && config.emptyImageLabel && "adm-thumb--label")} aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    {image ? <img src={image} alt="" /> : <span>{config.emptyImageLabel ?? title(item).charAt(0)}</span>}
                  </div>
                ) : null}
                <div className="adm-row-main">
                  <button
                    type="button"
                    className="adm-row-title"
                    onClick={() => setEditing(item)}
                    data-testid={`button-${area}-open-${item.slug}`}
                  >
                    {title(item)}
                  </button>
                  <p className="adm-row-meta">
                    {config.subtitle?.(item) ? <span>{config.subtitle(item)}</span> : null}
                    <span>Updated {relativeTime(item.updatedAt)}</span>
                  </p>
                  {flag ? <FlagBadge>{flag}</FlagBadge> : null}
                </div>
                <div className="adm-row-status">
                  <StatusBadge status={item.status} />
                </div>
                <div className="adm-row-actions">
                  {STATUS_TRANSITIONS[item.status].map((to) => (
                    <button
                      key={to}
                      type="button"
                      className={cn("adm-button adm-button--sm", to === "PUBLISHED" ? "adm-button--primary" : "adm-button--secondary")}
                      disabled={busy}
                      onClick={() => changeStatus(item, to)}
                      data-testid={`button-${area}-status-${to.toLowerCase()}-${item.slug}`}
                    >
                      {busy ? <Loader2 aria-hidden size={14} className="adm-spin" /> : null}
                      {transitionLabel(item.status, to)}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="adm-icon-button"
                    aria-label={`Edit ${title(item)}`}
                    onClick={() => setEditing(item)}
                    data-testid={`button-${area}-edit-${item.slug}`}
                  >
                    <Pencil aria-hidden size={16} />
                  </button>
                  {publicPath ? (
                    <a
                      className="adm-icon-button"
                      href={publicPath}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View ${title(item)} on the site (opens in a new tab)`}
                      data-testid={`link-${area}-view-${item.slug}`}
                    >
                      <ExternalLink aria-hidden size={16} />
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="adm-icon-button adm-icon-button--danger"
                    aria-label={`Delete ${title(item)}`}
                    onClick={() => setDeleting(item)}
                    data-testid={`button-${area}-delete-${item.slug}`}
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ListStatus
        area={area}
        loading={list.loading}
        error={list.error}
        hasMore={list.hasMore}
        loadingMore={list.loadingMore}
        onLoadMore={list.loadMore}
        onRetry={list.reload}
        shown={list.items.length}
        total={list.total}
      />

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? `New ${config.singular}` : editing ? `Edit ${config.singular}` : ""}
        description={
          editing && editing !== "new" ? (
            <span className="adm-dialog-meta">
              <StatusBadge status={editing.status} /> {config.publishHint}
            </span>
          ) : (
            `New ${config.label.toLowerCase()} start as drafts. ${config.publishHint}`
          )
        }
        size="lg"
        testId={`dialog-${area}-edit`}
      >
        {editing ? (
          <FieldsForm
            key={editing === "new" ? "new" : editing.id}
            fields={config.fields}
            item={editing === "new" ? null : editing}
            mode={editing === "new" ? "create" : "update"}
            area={`${area}-form`}
            folder={config.folder}
            submitLabel={editing === "new" ? `Create ${config.singular}` : "Save changes"}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete this ${config.singular}?`}
        message={
          deleting ? (
            <p>
              &ldquo;{title(deleting)}&rdquo; will be removed permanently.
              {deleting.status === "PUBLISHED" ? " It will disappear from the public site." : ""} Archiving keeps it instead.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => (deleting ? remove(deleting) : undefined)}
        onClose={() => setDeleting(null)}
        testId={`dialog-${area}-delete`}
      />
    </div>
  );
}
