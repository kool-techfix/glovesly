import { CloudinaryImage as Image } from "@/components/cloudinary-image";

import { cn } from "@/lib/utils";

/*
 * The Glovesly logo image (public/brand/glovesly-logo.png: 1299×1211, transparent
 * background, globe mark with the RC number, no wordmark). On dark backgrounds
 * it can sit on a white tile. Hook-free: usable in Server and Client Components.
 */

export const LOGO_SRC = "https://res.cloudinary.com/dikbulrav/image/upload/v1795449458/glovesly/Glossy_Globe_Orbit_Logo_obvwli.png";
/** Intrinsic width ÷ height of the logo file. */
export const LOGO_RATIO = 1299 / 1211;
export const LOGO_ALT = "Glovesly Pro-Project";

export function LogoImage({
  size = 44,
  tile = false,
  priority = false,
  alt = LOGO_ALT,
  className,
}: {
  /** Rendered height in px; the width follows the logo's proportions. */
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
      <Image
        src={LOGO_SRC}
        alt={alt}
        width={Math.round(size * LOGO_RATIO)}
        height={size}
        preload={priority}
        sizes={`${Math.round(size * LOGO_RATIO)}px`}
      />
    </span>
  );
}
