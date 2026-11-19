import Image from "next/image";

import { cn } from "@/lib/utils";

/*
 * The Glovesly logo image (public/brand/glovely-logo.png: a 500×500 JPEG on a
 * white background, no wordmark). On dark backgrounds it sits on a white tile
 * because the file has no transparency. Hook-free: usable in Server and
 * Client Components.
 */

export const LOGO_SRC = "/brand/glovely-logo.png";
export const LOGO_ALT = "Glovesly Pro-Project";

export function LogoImage({
  size = 44,
  tile = false,
  priority = false,
  alt = LOGO_ALT,
  className,
}: {
  /** Rendered height and width in px (the logo is square). */
  size?: number;
  /** White tile behind the logo, for dark backgrounds. */
  tile?: boolean;
  /** Preload above the fold (Next 16's `preload`, which replaced `priority`). */
  priority?: boolean;
  alt?: string;
  className?: string;
}) {
  return (
    <span className={cn("brand-logo", tile && "brand-logo-tile", className)}>
      <Image src={LOGO_SRC} alt={alt} width={size} height={size} preload={priority} sizes={`${size}px`} />
    </span>
  );
}
