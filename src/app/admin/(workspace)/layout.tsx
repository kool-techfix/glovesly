import { redirect } from "next/navigation";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminProvider } from "@/lib/admin/admin-store";
import { getCurrentActor } from "@/lib/auth/auth-guard";
import { authService } from "@/Services/auth.service";
import { settingsService } from "@/Services/settings.service";
import { summaryService } from "@/Services/summary.service";

/*
 * Server gate: every full page load under the workspace checks the session.
 * Client-side navigation relies on the API guards (a 401 sends the browser
 * back to /admin/login).
 */
export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/admin/login");

  const [me, workspace, summary] = await Promise.all([authService.me(actor), settingsService.get(), summaryService.get()]);

  return (
    <AdminProvider initialMe={me} initialWorkspace={workspace} initialSummary={summary}>
      <AdminLayout>{children}</AdminLayout>
    </AdminProvider>
  );
}
