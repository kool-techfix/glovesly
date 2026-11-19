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
 */

const MIN_ITEMS_PER_HALF = 8;

function LogoCard({ partner, hidden }: { partner: PartnerDto; hidden: boolean }) {
  const content = partner.logoUrl ? (
    <Image src={partner.logoUrl} alt={hidden ? "" : partner.name} fill sizes="180px" className="object-contain p-5" />
  ) : (
    <span className="logo-card-name">{partner.name}</span>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noreferrer"
        className="logo-card focus-ring"
        tabIndex={hidden ? -1 : undefined}
        data-testid={hidden ? undefined : `link-partner-${partner.slug}`}
      >
        {content}
        {hidden ? null : <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return <div className="logo-card">{content}</div>;
}

function Marquee({ partners, label }: { partners: PartnerDto[]; label: string }) {
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
            <LogoCard partner={partner} hidden={hidden} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PartnersSection({ partners }: { partners: PartnerDto[] }) {
  const groups = PARTNER_TYPES.map((type) => ({
    type,
    ...partnerGroups[type],
    partners: partners.filter((partner) => partner.type === type),
  })).filter((group) => group.partners.length > 0);

  if (!groups.length) return null;

  return (
    <section className="section-pad section-band" aria-labelledby="partners-title">
      <div className="container-wide">
        <div id="partners-title">
          <SectionHeading eyebrow={home.partners.eyebrow} title={home.partners.title} description={home.partners.description} />
        </div>
        <div className="partner-rows mt-12">
          {groups.map((group) => (
            <div key={group.type} className="partner-row">
              <div className="partner-row-copy">
                <h3 className="card-title">{group.title}</h3>
                <p className="card-text mt-2">{group.description}</p>
              </div>
              <Marquee partners={group.partners} label={group.title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
