import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UsersManager } from "@/components/admin/users-manager";
import { getCurrentActor } from "@/lib/auth/auth-guard";

export const metadata: Metadata = { title: "Users" };

/** ADMIN only. The API enforces this too; editors are sent to the dashboard. */
export default async function UsersPage() {
  const actor = await getCurrentActor();
  if (actor?.role !== "ADMIN") redirect("/admin");
  return <UsersManager />;
}
