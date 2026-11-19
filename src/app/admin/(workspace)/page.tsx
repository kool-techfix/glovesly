import type { Metadata } from "next";

import { Dashboard } from "@/components/admin/dashboard";
import { activityService } from "@/Services/activity.service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { items } = await activityService.list({ page: 1, pageSize: 12 });
  return <Dashboard activity={items} />;
}
