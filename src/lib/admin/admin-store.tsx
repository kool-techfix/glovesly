"use client";

import { createContext, use, useState } from "react";
import { Toaster } from "sonner";

import { api } from "@/lib/admin/api-client";
import type { WorkspaceSettingsDto } from "@/Services/settings.service";
import type { AdminSummaryDto } from "@/Services/summary.service";
import type { UserDto } from "@/Services/user.service";

/*
 * Workspace-wide client state: the signed-in user, workspace settings and the
 * summary counts behind the header and sidebar badges. Seeded from the
 * server layout; screens call refreshSummary() after mutations.
 */

type AdminContextValue = {
  me: UserDto;
  isAdmin: boolean;
  workspace: WorkspaceSettingsDto;
  setWorkspace: (workspace: WorkspaceSettingsDto) => void;
  summary: AdminSummaryDto;
  refreshSummary: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({
  initialMe,
  initialWorkspace,
  initialSummary,
  children,
}: {
  initialMe: UserDto;
  initialWorkspace: WorkspaceSettingsDto;
  initialSummary: AdminSummaryDto;
  children: React.ReactNode;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [summary, setSummary] = useState(initialSummary);

  async function refreshSummary() {
    try {
      setSummary(await api<AdminSummaryDto>("/api/admin/summary"));
    } catch {
      // Badges are a convenience; keep the last known counts.
    }
  }

  return (
    <AdminContext
      value={{
        me: initialMe,
        isAdmin: initialMe.role === "ADMIN",
        workspace,
        setWorkspace,
        summary,
        refreshSummary,
      }}
    >
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </AdminContext>
  );
}

export function useAdmin(): AdminContextValue {
  const value = use(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside <AdminProvider>.");
  return value;
}
