import Link from "next/link";

import { LogoImage } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

/**
 * Header/footer lockup: the logo image (its alt text names the company) plus
 * the company name as visible text. The image has no wordmark of its own, so
 * the text is shown beside it; it is aria-hidden to avoid a double announcement.
 */
export function Logo({
  onDark = false,
  priority = false,
  className,
  testId,
}: {
  onDark?: boolean;
  priority?: boolean;
  className?: string;
  testId: string;
}) {
  return (
    <Link href="/" className={cn("site-logo focus-ring", onDark && "site-logo-on-dark", className)} data-testid={testId}>
      <LogoImage size={44} tile={onDark} priority={priority} />
      <span className="site-logo-text" aria-hidden="true">
        Glovesly <span className="site-logo-sub">Pro-Project</span>
      </span>
    </Link>
  );
}
