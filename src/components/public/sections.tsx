import { ButtonLink, SectionHeading } from "@/components/site";
import { ctaBand, type ClosingBandContent } from "@/data/content";
import { cn } from "@/lib/utils";

/** Flat accent closing band with a primary and a white-outline secondary button. */
export function ClosingBand({
  id,
  content,
  primaryTestId,
  secondaryTestId,
}: {
  id: string;
  content: ClosingBandContent;
  primaryTestId: string;
  secondaryTestId: string;
}) {
  return (
    <section className="closing-band" aria-labelledby={id}>
      <div className="container-wide closing-band-inner">
        <h2 id={id} className="display closing-band-title">
          {content.title}
        </h2>
        <div className="closing-band-actions">
          <ButtonLink href={content.primaryCta.href} testId={primaryTestId}>
            {content.primaryCta.label}
          </ButtonLink>
          <ButtonLink href={content.secondaryCta.href} variant="secondary" onDark testId={secondaryTestId}>
            {content.secondaryCta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/** Closing call-to-action band used at the bottom of most pages. */
export function CtaBand({ area }: { area: string }) {
  return (
    <section className="cta-band" aria-labelledby={`cta-${area}`}>
      <div className="container-wide cta-band-inner">
        <div>
          <h2 id={`cta-${area}`} className="display cta-band-title">
            {ctaBand.title}
          </h2>
          {ctaBand.description ? <p className="cta-band-text">{ctaBand.description}</p> : null}
        </div>
        <ButtonLink href={ctaBand.cta.href} variant="secondary" onDark testId={`link-${area}-cta-band`}>
          {ctaBand.cta.label}
        </ButtonLink>
      </div>
    </section>
  );
}

/** A section with a heading row (heading + optional "see all" link) and content. */
export function ListSection({
  eyebrow,
  title,
  description,
  action,
  band = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  band?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("section-pad", band && "section-band")}>
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          {action}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

export function EmptyNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("empty-note", className)}>{children}</p>;
}
