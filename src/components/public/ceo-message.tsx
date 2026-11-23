import { CloudinaryImage as Image } from "@/components/cloudinary-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Eyebrow, SectionHeading } from "@/components/site";
import { ceoMessage } from "@/data/content";
import { cn } from "@/lib/utils";

/* "Message from the CEO". Hook-free, safe in Server Components. */

function Signature() {
  return (
    <figcaption className="ceo-cite">
      <span className="ceo-name">{ceoMessage.name}</span>
      <span className="ceo-role">{ceoMessage.role}</span>
    </figcaption>
  );
}

/** Full message for the About page. Anchor: /about#ceo-message. */
export function CeoMessageSection({ band = true }: { band?: boolean }) {
  const { photo } = ceoMessage;
  return (
    <section id={ceoMessage.id} className={cn("section-pad ceo-section", band && "section-band")} aria-labelledby={`${ceoMessage.id}-title`}>
      <div className={cn("container-wide ceo-layout", photo && "has-photo")}>
        <div>
          <div id={`${ceoMessage.id}-title`}>
            <SectionHeading eyebrow={ceoMessage.eyebrow} title={ceoMessage.title} />
          </div>
          {photo ? (
            <div className="ceo-photo">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 860px) 100vw, 40vw" />
            </div>
          ) : null}
        </div>
        <figure className="ceo-figure">
          <span className="ceo-mark" aria-hidden="true">
            “
          </span>
          <blockquote className="ceo-quote">
            {ceoMessage.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </blockquote>
          <Signature />
        </figure>
      </div>
    </section>
  );
}

/** Short home-page teaser. Toggle with `showCeoTeaserOnHome` in content.ts. */
export function CeoTeaser() {
  return (
    <section className="ceo-teaser" aria-labelledby="ceo-teaser-title">
      <div className="container-wide ceo-teaser-inner">
        <Eyebrow>
          <span id="ceo-teaser-title">{ceoMessage.title}</span>
        </Eyebrow>
        <figure className="ceo-teaser-figure">
          <blockquote className="display ceo-teaser-quote">
            <p>“{ceoMessage.excerpt}”</p>
          </blockquote>
          <Signature />
        </figure>
        <Link href={`/about#${ceoMessage.id}`} className="link-arrow focus-ring" data-testid="link-home-ceo-message">
          Read the full message <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </section>
  );
}
