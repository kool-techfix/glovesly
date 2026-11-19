"use client";

import { KeyRound, LogOut, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, ConfirmDialog, Dialog, EmptyState, ListStatus, PageHeading, StatusBadge } from "@/components/admin/admin-parts";
import { FieldsForm } from "@/components/admin/fields-form";
import type { FieldConfig } from "@/components/admin/module-configs";
import { useAdmin } from "@/lib/admin/admin-store";
import { api, errorMessage } from "@/lib/admin/api-client";
import { initials, relativeTime } from "@/lib/admin/format";
import { useAdminList } from "@/lib/admin/use-admin-list";
import type { UserDto } from "@/Services/user.service";

const ROLE_OPTIONS = [
  { value: "EDITOR", label: "Editor: manages content and messages" },
  { value: "ADMIN", label: "Administrator: also manages users and settings" },
] as const;

const inviteFields: FieldConfig[] = [
  { name: "name", label: "Name", kind: "text", required: true },
  { name: "email", label: "Email", kind: "text", required: true, placeholder: "name@example.com" },
  { name: "role", label: "Role", kind: "select", required: true, options: ROLE_OPTIONS, defaultValue: "EDITOR", wide: true },
];

function editFields(isSelf: boolean): FieldConfig[] {
  return [
    { name: "name", label: "Name", kind: "text", required: true, wide: true },
    {
      name: "role",
      label: "Role",
      kind: "select",
      required: true,
      options: ROLE_OPTIONS,
      readOnly: isSelf,
      help: isSelf ? "You cannot change your own role." : undefined,
    },
    {
      name: "status",
      label: "Status",
      kind: "select",
      required: true,
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "DISABLED", label: "Disabled (cannot sign in)" },
      ],
      readOnly: isSelf,
      help: isSelf ? "You cannot disable your own account." : "Disabling signs the user out everywhere.",
    },
  ];
}

type PendingAction = { kind: "delete" | "sessions" | "link"; user: UserDto };

export function UsersManager() {
  const { me } = useAdmin();
  const list = useAdminList<UserDto>("/api/admin/users");
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  async function invite(payload: Record<string, unknown>) {
    const user = await api<UserDto>("/api/admin/users", { method: "POST", body: payload });
    toast.success(`Invite sent to ${user.email}.`);
    setInviting(false);
    list.reload();
  }

  async function save(payload: Record<string, unknown>) {
    if (!editing) return;
    const updated = await api<UserDto>(`/api/admin/users/${editing.id}`, { method: "PATCH", body: payload });
    list.replaceItem(updated);
    toast.success("User updated.");
    setEditing(null);
  }

  async function runPending() {
    if (!pending) return;
    const { kind, user } = pending;
    try {
      if (kind === "delete") {
        await api(`/api/admin/users/${user.id}`, { method: "DELETE" });
        list.removeItem(user.id);
        toast.success(`Deleted ${user.email}.`);
      } else if (kind === "sessions") {
        const result = await api<{ revoked: number }>(`/api/admin/users/${user.id}/sessions`, { method: "DELETE" });
        toast.success(`Signed ${user.name} out of ${result.revoked} ${result.revoked === 1 ? "session" : "sessions"}.`);
      } else {
        const result = await api<{ purpose: "INVITE" | "RESET" }>(`/api/admin/users/${user.id}/password-link`, { method: "POST" });
        toast.success(`${result.purpose === "INVITE" ? "Invite" : "Password reset"} link sent to ${user.email}.`);
      }
      setPending(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  const confirmCopy: Record<PendingAction["kind"], { title: string; label: string; message: (user: UserDto) => string }> = {
    delete: {
      title: "Delete this user?",
      label: "Delete user",
      message: (user) => `${user.name} (${user.email}) will lose access immediately. Their news posts are kept without an author.`,
    },
    sessions: {
      title: "Sign out everywhere?",
      label: "Sign out everywhere",
      message: (user) =>
        user.id === me.id
          ? "You will be signed out on every device, including this one."
          : `${user.name} will be signed out on every device.`,
    },
    link: {
      title: "Send a password link?",
      label: "Send link",
      message: (user) =>
        user.invitePending
          ? `${user.email} will get a new invite link (valid for 3 days). Older links stop working.`
          : `${user.email} will get a password reset link (valid for 1 hour). Older links stop working.`,
    },
  };

  return (
    <div className="adm-screen">
      <PageHeading
        title="Users"
        description="People who can sign in to this workspace."
        actions={
          <button type="button" className="adm-button adm-button--primary" onClick={() => setInviting(true)} data-testid="button-users-invite">
            <UserPlus aria-hidden size={18} /> Invite user
          </button>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search aria-hidden size={16} />
          <label htmlFor="users-search" className="adm-visually-hidden">
            Search users
          </label>
          <input
            id="users-search"
            type="search"
            className="adm-input"
            placeholder="Search by name or email"
            value={list.searchInput}
            onChange={(event) => list.setSearchInput(event.target.value)}
            data-testid="input-users-search"
          />
        </div>
        <div className="adm-segmented" role="group" aria-label="Filter by status">
          {[
            { value: "", label: "All" },
            { value: "ACTIVE", label: "Active" },
            { value: "DISABLED", label: "Disabled" },
          ].map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              className="adm-segment"
              aria-pressed={list.status === filter.value}
              onClick={() => list.setStatus(filter.value)}
              data-testid={`button-users-filter-${(filter.value || "all").toLowerCase()}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {!list.loading && !list.error && list.items.length === 0 ? (
        <EmptyState title="No users match." />
      ) : (
        <ul className="adm-rows" data-testid="list-users">
          {list.items.map((user) => {
            const isSelf = user.id === me.id;
            return (
              <li key={user.id} className="adm-row" data-testid={`row-users-${user.id}`}>
                <div className="adm-thumb adm-thumb--round" aria-hidden>
                  <span>{initials(user.name)}</span>
                </div>
                <div className="adm-row-main">
                  <button type="button" className="adm-row-title" onClick={() => setEditing(user)} data-testid={`button-users-open-${user.id}`}>
                    {user.name}
                    {isSelf ? <span className="adm-muted"> (you)</span> : null}
                  </button>
                  <p className="adm-row-meta">
                    <span>{user.email}</span>
                    <span>{user.lastLoginAt ? `Last signed in ${relativeTime(user.lastLoginAt)}` : "Never signed in"}</span>
                  </p>
                </div>
                <div className="adm-row-status">
                  <StatusBadge status={user.role} label={user.role === "ADMIN" ? "Administrator" : "Editor"} />
                  {user.status === "DISABLED" ? <StatusBadge status="DISABLED" /> : null}
                  {user.invitePending ? <Badge tone="warning">Invite pending</Badge> : null}
                </div>
                <div className="adm-row-actions">
                  <button
                    type="button"
                    className="adm-icon-button"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => setEditing(user)}
                    data-testid={`button-users-edit-${user.id}`}
                  >
                    <Pencil aria-hidden size={16} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-button"
                    aria-label={`Send ${user.invitePending ? "an invite" : "a password reset"} link to ${user.name}`}
                    title={user.invitePending ? "Resend invite" : "Send password reset link"}
                    disabled={user.status !== "ACTIVE"}
                    onClick={() => setPending({ kind: "link", user })}
                    data-testid={`button-users-link-${user.id}`}
                  >
                    <KeyRound aria-hidden size={16} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-button"
                    aria-label={`Sign ${user.name} out everywhere`}
                    title="Sign out everywhere"
                    onClick={() => setPending({ kind: "sessions", user })}
                    data-testid={`button-users-sessions-${user.id}`}
                  >
                    <LogOut aria-hidden size={16} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-button adm-icon-button--danger"
                    aria-label={`Delete ${user.name}`}
                    title={isSelf ? "You cannot delete your own account" : "Delete"}
                    disabled={isSelf}
                    onClick={() => setPending({ kind: "delete", user })}
                    data-testid={`button-users-delete-${user.id}`}
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
        area="users"
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
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite a user"
        description="They get an email with a link to choose a password. The link works for 3 days."
        testId="dialog-users-invite"
      >
        {inviting ? (
          <FieldsForm
            fields={inviteFields}
            mode="create"
            area="users-invite"
            folder="misc"
            submitLabel="Send invite"
            onSubmit={invite}
            onCancel={() => setInviting(false)}
          />
        ) : null}
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Edit user" description={editing?.email} testId="dialog-users-edit">
        {editing ? (
          <FieldsForm
            key={editing.id}
            fields={editFields(editing.id === me.id)}
            item={editing}
            mode="update"
            area="users-edit"
            folder="misc"
            submitLabel="Save changes"
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? confirmCopy[pending.kind].title : ""}
        message={pending ? <p>{confirmCopy[pending.kind].message(pending.user)}</p> : null}
        confirmLabel={pending ? confirmCopy[pending.kind].label : ""}
        destructive={pending?.kind === "delete"}
        onConfirm={runPending}
        onClose={() => setPending(null)}
        testId="dialog-users-confirm"
      />
    </div>
  );
}
