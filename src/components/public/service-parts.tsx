import Image from "next/image";

import { cn } from "@/lib/utils";

/* Pieces shared by /services and /services/[slug]. Hook-free, safe in Server Components. */

/**
 * A service photo, or a flat accent block while the service has no image.
 * Decorative in both cases: the service title sits right next to it.
 */
export function ServiceMedia({
  src,
  sizes,
  preload = false,
  className,
}: {
  src: string | null;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("service-media", className)} aria-hidden={src ? undefined : true}>
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" {...(preload ? { preload: true } : { loading: "lazy" as const })} />
      ) : null}
    </div>
  );
}

/** Capabilities as short rows with a small square primary marker, two columns from 560px. */
export function CapabilityList({ items, label, className }: { items: string[]; label: string; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={cn("capability-list", className)} aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
