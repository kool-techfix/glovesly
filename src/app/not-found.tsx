import type { Metadata } from "next";

import PublicNotFound from "@/app/(public)/not-found";
import PublicLayout from "@/app/(public)/layout";

export const metadata: Metadata = { title: "Page not found" };

/** Unmatched URLs render outside any route group, so wrap them in the public chrome here. */
export default function NotFound() {
  return (
    <PublicLayout>
      <PublicNotFound />
    </PublicLayout>
  );
}
