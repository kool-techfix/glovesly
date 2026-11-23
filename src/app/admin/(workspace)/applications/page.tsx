import type { Metadata } from "next";

import { ApplicationsInbox } from "@/components/admin/applications-inbox";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams;
  return <ApplicationsInbox initialId={typeof id === "string" ? id : undefined} />;
}
