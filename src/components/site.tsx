import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/* Hook-free building blocks shared by public pages. Safe in Server Components. */

type EyebrowProps = {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
};

export function Eyebrow({ children, onDark = false, className }: EyebrowProps) {
  return (
    <p className={cn("eyebrow", onDark && "eyebrow-on-dark", className)}>
      {children}
    </p>
  );
}

type ButtonLinkProps = {
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

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("page-hero", className)}>
      <div className="container-wide relative z-10">
        <Eyebrow className="reveal">{eyebrow}</Eyebrow>
        <h1 className="display page-hero-title reveal reveal-delay-1">{title}</h1>
        {description ? (
          <p className="lede page-hero-description reveal reveal-delay-2">
            {description}
          </p>
        ) : null}
        {children ? (
          <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
            {children}
          </div>
        ) : null}
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
  return (
    <div className={cn("section-heading", className)} data-align={align}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading className="display section-heading-title">{title}</Heading>
      {description ? (
        <p className="lede section-heading-description">{description}</p>
      ) : null}
    </div>
  );
}
