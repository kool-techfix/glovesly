import Image from "next/image";

import { SectionHeading } from "@/components/site";
import { home, partnerGroups } from "@/data/content";
import { PARTNER_TYPES } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { PartnerDto } from "@/Services/partner.service";

/*
 * Clients & Partners: one row per partner type, each with a CSS-only marquee.
 * The track holds the logos twice and slides by -50%, so the loop is seamless.
 * Short lists are repeated so the strip is always wider than its viewport.
 * Only the first copy of each logo is exposed to assistive tech and the
 * keyboard; the repeats are aria-hidden. Pauses on hover and focus-within;
 * under prefers-reduced-motion it becomes a static, wrapped list.
 *
 * Cards vary in width (sized by each logo's aspect ratio); the loop still
 * works because the second half is an exact copy of the first.
 */

const MIN_ITEMS_PER_HALF = 8;

/** Width ÷ height used when a logo's size is unknown (admin uploads). */
const DEFAULT_LOGO_RATIO = 2.5;

export type LogoTone = "light" | "dark";

/**
 * Which file to show. "light" (white cards): logoUrl. "dark": logoOnDarkUrl
 * when there is one, otherwise logoUrl on a white tile so it stays legible.
 */
function logoFor(partner: PartnerDto, tone: LogoTone) {
  if (tone === "dark" && partner.logoOnDarkUrl) return { src: partner.logoOnDarkUrl, onDarkArtwork: true };
  return { src: partner.logoUrl, onDarkArtwork: false };
}

/** Logo card sized by the logo's aspect ratio (see .logo-card in globals.css). */
export function LogoCard({ partner, hidden = false, tone = "light" }: { partner: PartnerDto; hidden?: boolean; tone?: LogoTone }) {
  const { src, onDarkArtwork } = logoFor(partner, tone);
  const ratio = partner.logoWidth && partner.logoHeight ? partner.logoWidth / partner.logoHeight : DEFAULT_LOGO_RATIO;
  const style = { "--logo-ratio": ratio.toFixed(3) } as React.CSSProperties;
  const className = cn("logo-card", onDarkArtwork && "logo-card--on-dark");

  const content = src ? (
    <span className="logo-card-media">
      <Image
        src={src}
        alt={hidden ? "" : `${partner.name} logo`}
        fill
        sizes="18rem"
        // SVGs are served as-is (no optimiser, no dangerouslyAllowSVG needed).
        unoptimized={src.toLowerCase().endsWith(".svg")}
        className="object-contain"
      />
    </span>
  ) : (
    <span className="logo-card-name">{partner.name}</span>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(className, "focus-ring")}
        style={style}
        tabIndex={hidden ? -1 : undefined}
        data-testid={hidden ? undefined : `link-partner-${partner.slug}`}
      >
        {content}
        {hidden ? null : <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

function Marquee({ partners, label, tone }: { partners: PartnerDto[]; label: string; tone: LogoTone }) {
  const repeats = Math.max(1, Math.ceil(MIN_ITEMS_PER_HALF / partners.length));
  const half = Array.from({ length: repeats }, (_, r) => partners.map((partner) => ({ partner, hidden: r > 0 }))).flat();
  const track = [...half, ...half.map((item) => ({ ...item, hidden: true, duplicate: true }))];

  return (
    <div className="marquee" style={{ "--marquee-duration": `${half.length * 3.5}s` } as React.CSSProperties}>
      <ul className="marquee-track" aria-label={label}>
        {track.map(({ partner, hidden, ...rest }, index) => (
          <li
            key={`${partner.id}-${index}`}
            className={cn("marquee-item", hidden && "marquee-repeat", "duplicate" in rest && "marquee-duplicate")}
            aria-hidden={hidden || undefined}
          >
            <LogoCard partner={partner} hidden={hidden} tone={tone} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PartnersSection({ partners, tone = "light" }: { partners: PartnerDto[]; tone?: LogoTone }) {
  const groups = PARTNER_TYPES.map((type) => ({
    type,
    ...partnerGroups[type],
    partners: partners.filter((partner) => partner.type === type),
  })).filter((group) => group.partners.length > 0);

  if (!groups.length) return null;

  return (
    <section
      className={cn("section-pad", tone === "dark" ? "partners-section--dark" : "section-band")}
      aria-labelledby="partners-title"
    >
      <div className="container-wide">
        <div id="partners-title">
          <SectionHeading eyebrow={home.partners.eyebrow} title={home.partners.title} description={home.partners.description} />
        </div>
        <div className="partner-rows mt-12">
          {groups.map((group) => (
            <div key={group.type} className="partner-row">
              <div className="partner-row-copy">
                <h3 className="card-title">{group.title}</h3>
                {group.description ? <p className="card-text mt-2">{group.description}</p> : null}
              </div>
              <Marquee partners={group.partners} label={group.title} tone={tone} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
