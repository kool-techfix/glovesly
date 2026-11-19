import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Cloudinary image via next/image, or a branded placeholder block when the
 * record has no image yet (all seeded placeholder rows).
 */
export function MediaImage({
  src,
  alt,
  sizes,
  label,
  priority = false,
  className,
  fit = "cover",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  /** Text shown in the placeholder (e.g. the title's first letter or initials). */
  label?: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain";
}) {
  return (
    <div className={cn("media-frame", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={fit === "contain" ? "object-contain p-6" : "object-cover"} />
      ) : (
        <div className="media-placeholder" role={alt ? "img" : undefined} aria-label={alt || undefined}>
          <span aria-hidden="true">{label ?? ""}</span>
        </div>
      )}
    </div>
  );
}
