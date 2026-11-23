import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroImage } from "@/components/hero-image";
import { StaggerContainer, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/* Hook-free building blocks shared by public pages. Safe in Server Components. */

type EyebrowProps = {
  children: React.ReactNode;
  onDark?: boolean;
  /** Render as a heading when the eyebrow is the section's only title. */
  as?: "p" | "h2";
  id?: string;
  className?: string;
};

export function Eyebrow({ children, onDark = false, as: Tag = "p", id, className }: EyebrowProps) {
  return (
    <Tag id={id} className={cn("eyebrow", onDark && "eyebrow-on-dark", className)}>
      {children}
    </Tag>
  );
}

export type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  /** Required: `<kind>-<area>-<name>`, e.g. `link-hero-contact`. */
  testId: string;
  variant?: "primary" | "secondary";
  /** Use on dark or coloured bands (secondary variant only). */
  onDark?: boolean;
  /** Hide the trailing arrow. */
  noIcon?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  testId,
  variant = "primary",
  onDark = false,
  noIcon = false,
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      data-testid={testId}
      className={cn(
        variant === "primary" ? "button-primary" : "button-secondary",
        onDark && variant === "secondary" && "button-on-dark",
        "focus-ring",
        className,
      )}
    >
      <span>{children}</span>
      {noIcon ? null : <ArrowRight aria-hidden="true" className="button-icon" />}
    </Link>
  );
}

/* ------------------------------------------------------------------
   PageHero: one component, five variants (see globals.css "Page hero").
   Server Component. Flat colours only; photos sit under a flat
   rgba(0,0,0,0.55) shade. A missing image becomes a flat navy tile.
   ------------------------------------------------------------------ */

export type HeroVariant = "photo" | "solid" | "split" | "compact" | "article";
export type HeroImageData = { src: string; alt: string };
export type HeroCrumb = { label: string; href?: string };
export type HeroFact = { label: string; value: React.ReactNode };
export type HeroTab = { label: string; href: string; active?: boolean; testId?: string };
export type HeroAction = Omit<ButtonLinkProps, "children" | "onDark"> & { label: string };

type PageHeroProps = {
  variant?: HeroVariant;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** photo / split. Null or missing → flat navy tile. */
  image?: HeroImageData | null;
  /** Omit on the About page and on /. The last item is the current page. */
  breadcrumbs?: HeroCrumb[];
  actions?: HeroAction[];
  /** photo: white fact bar; split: plain lines; article: inline meta line. */
  facts?: HeroFact[];
  /** solid: square anchor links; compact: underline filter links. */
  tabs?: HeroTab[];
  /** aria-label for the tabs nav. */
  tabsLabel?: string;
  /** solid background: "primary" (default) or "accent". */
  tone?: "primary" | "accent";
  /** split only: the contact layout (white card on the right, overlapping the bottom edge). */
  children?: React.ReactNode;
  /** Heading level. Always h1 on real pages; h2 only for the /design preview. */
  as?: "h1" | "h2";
  className?: string;
};

function HeroBreadcrumbs({ items }: { items: HeroCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="hero-breadcrumbs reveal">
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {item.href && !last ? (
                <Link href={item.href} className="focus-ring" data-testid={`link-breadcrumb-${index}`}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function HeroTabs({ tabs, label, style }: { tabs: HeroTab[]; label: string; style: "square" | "underline" }) {
  return (
    <nav aria-label={label} className={cn("hero-tabs", `hero-tabs--${style}`, "reveal reveal-delay-3")}>
      <ul>
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              scroll={tab.href.startsWith("#") ? undefined : false}
              className="hero-tab focus-ring"
              aria-current={tab.active ? "page" : undefined}
              data-testid={tab.testId}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Photo under the flat shade, or a flat navy tile. */
function HeroMedia({ image, className, sizes = "100vw" }: { image?: HeroImageData | null; className?: string; sizes?: string }) {
  return (
    <div className={cn("hero-media", !image && "hero-media--tile", className)} aria-hidden={image ? undefined : true}>
      {image ? (
        <>
          <HeroImage src={image.src} alt={image.alt} sizes={sizes} priority signalReady className="hero-media-image" />
          <span className="hero-shade" />
        </>
      ) : null}
    </div>
  );
}

function HeroActions({ actions, onDark }: { actions: HeroAction[]; onDark: boolean }) {
  return (
    <div className="hero-actions reveal reveal-delay-3">
      {actions.map(({ label, ...action }) => (
        <ButtonLink key={action.testId} {...action} onDark={onDark}>
          {label}
        </ButtonLink>
      ))}
    </div>
  );
}

export function PageHero({
  variant = "compact",
  eyebrow,
  title,
  description,
  image,
  breadcrumbs,
  actions,
  facts,
  tabs,
  tabsLabel = "Sections",
  tone = "primary",
  children,
  as: Heading = "h1",
  className,
}: PageHeroProps) {
  const onDark = variant === "photo" || variant === "solid" || variant === "split";
  const visibleFacts = (facts ?? []).filter((fact) => fact.value !== null && fact.value !== undefined && fact.value !== "");

  const heading = (
    <Heading className={cn("display hero-title reveal reveal-delay-1")}>{title}</Heading>
  );
  const eyebrowEl = eyebrow ? (
    <Eyebrow onDark={onDark} className="hero-eyebrow reveal">
      {eyebrow}
    </Eyebrow>
  ) : null;
  const descriptionEl = description ? <p className="lede hero-description reveal reveal-delay-2">{description}</p> : null;
  const crumbs = breadcrumbs?.length ? <HeroBreadcrumbs items={breadcrumbs} /> : null;
  const actionsEl = actions?.length ? <HeroActions actions={actions} onDark={onDark} /> : null;

  if (variant === "photo") {
    return (
      <>
        <section className={cn("hero hero--photo", visibleFacts.length && "has-facts", className)}>
          <HeroMedia image={image} className="hero-media--fill" />
          <div className="container-wide hero-content">
            {crumbs}
            {eyebrowEl}
            {heading}
            {descriptionEl}
            {actionsEl}
          </div>
        </section>
        {visibleFacts.length ? (
          <div className="container-wide hero-factbar-wrap">
            <dl className="hero-factbar reveal reveal-delay-2" data-count={visibleFacts.length}>
              {visibleFacts.map((fact) => (
                <div key={fact.label} className="hero-factbar-cell">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </>
    );
  }

  if (variant === "solid") {
    return (
      <section className={cn("hero hero--solid", tone === "accent" && "hero--accent", className)}>
        <div className="container-wide hero-content">
          {crumbs}
          {eyebrowEl}
          {heading}
          {descriptionEl}
          {actionsEl}
          {tabs?.length ? <HeroTabs tabs={tabs} label={tabsLabel} style="square" /> : null}
        </div>
      </section>
    );
  }

  if (variant === "split") {
    const contact = Boolean(children);
    const panel = (
      <div className="hero-split-panel">
        {crumbs}
        {eyebrowEl}
        {heading}
        {descriptionEl}
        {visibleFacts.length ? (
          <dl className="hero-lines reveal reveal-delay-2">
            {visibleFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {actionsEl}
      </div>
    );
    if (contact) {
      return (
        <section className={cn("hero hero--split hero--contact", tone === "accent" && "hero--accent", className)}>
          <div className="container-wide hero-contact-grid">
            {panel}
            <div className="hero-contact-card reveal reveal-delay-2">{children}</div>
          </div>
        </section>
      );
    }
    return (
      <section className={cn("hero hero--split", tone === "accent" && "hero--accent", className)}>
        <HeroMedia image={image} className="hero-split-media" sizes="(min-width: 1024px) 50vw, 100vw" />
        <div className="hero-split-body">
          <div className="hero-split-inner">{panel}</div>
        </div>
      </section>
    );
  }

  if (variant === "article") {
    return (
      <section className={cn("hero hero--article", className)}>
        <div className="container-narrow hero-content">
          {crumbs}
          {eyebrowEl}
          {heading}
          {descriptionEl}
          {visibleFacts.length ? (
            <p className="hero-meta reveal reveal-delay-2">
              {visibleFacts.map((fact, index) => (
                <span key={fact.label}>
                  {index > 0 ? <span className="hero-meta-sep" aria-hidden="true">·</span> : null}
                  {fact.value}
                </span>
              ))}
            </p>
          ) : null}
          {actionsEl}
        </div>
      </section>
    );
  }

  // compact
  return (
    <section className={cn("hero hero--compact", className)}>
      <div className="container-wide hero-content">
        {crumbs}
        <div className={cn("hero-compact-row", description && "has-description")}>
          <div>
            {eyebrowEl}
            {heading}
          </div>
          {descriptionEl}
        </div>
        {actionsEl}
        {tabs?.length ? <HeroTabs tabs={tabs} label={tabsLabel} style="underline" /> : null}
      </div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "start" | "center";
  /** Heading level; defaults to h2. */
  as?: "h2" | "h3";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  // Reveals on scroll: eyebrow and heading first, then the description.
  return (
    <StaggerContainer className={cn("section-heading", className)} data-align={align} stagger={0.14}>
      {eyebrow ? (
        <StaggerItem>
          <Eyebrow>{eyebrow}</Eyebrow>
        </StaggerItem>
      ) : null}
      <StaggerItem as={Heading} className="display section-heading-title">
        {title}
      </StaggerItem>
      {description ? (
        <StaggerItem as="p" className="lede section-heading-description">
          {description}
        </StaggerItem>
      ) : null}
    </StaggerContainer>
  );
}
