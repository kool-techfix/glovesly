import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER LOGO: a text wordmark until the owner supplies the real logo
 * file. Swap the contents of this component only.
 */
export function Logo({ onDark = false, className, testId }: { onDark?: boolean; className?: string; testId: string }) {
  return (
    <Link href="/" className={cn("site-logo focus-ring", onDark && "site-logo-on-dark", className)} data-testid={testId}>
      <span className="site-logo-mark" aria-hidden="true">
        G
      </span>
      <span className="site-logo-text">
        Glovesly <span className="site-logo-sub">Pro-Project</span>
      </span>
      <span className="sr-only">, home</span>
    </Link>
  );
}
