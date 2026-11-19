import type { Metadata } from "next";

import { MessagesInbox } from "@/components/admin/messages-inbox";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams;
  return <MessagesInbox initialId={typeof id === "string" ? id : undefined} />;
}
