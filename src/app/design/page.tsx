import type { Metadata } from "next";

import { ButtonLink, Eyebrow, PageHero, SectionHeading } from "@/components/site";

// TEMPORARY design-system preview. Remove before launch.

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

const COLOUR_TOKENS = [
  { name: "--primary", note: "#1e73be", className: "bg-primary" },
  { name: "--primary-hover", note: "≈ #1a62a3", className: "bg-primary-hover" },
  { name: "--accent", note: "≈ #463DE1 (unconfirmed)", className: "bg-accent" },
  { name: "--background", note: "#FFFFFF", className: "bg-background" },
  { name: "--secondary", note: "#F8F8F8", className: "bg-secondary" },
  { name: "--foreground", note: "near-black", className: "bg-foreground" },
  { name: "--muted-foreground", note: "#505858", className: "bg-muted-foreground" },
  { name: "--border", note: "light grey", className: "bg-border" },
  { name: "--ring", note: "#1e73be", className: "bg-ring" },
] as const;

export default function DesignPage() {
  return (
    <main>
      <PageHero
        eyebrow="Design system"
        title="Glovesly design foundation"
        description="Temporary preview of tokens, typography and building blocks. Placeholder copy only."
      >
        <ButtonLink href="/design" testId="link-design-hero-primary">
          Primary action
        </ButtonLink>
        <ButtonLink href="/design" variant="secondary" testId="link-design-hero-secondary">
          Secondary action
        </ButtonLink>
      </PageHero>

      <section className="section-pad">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Tokens"
            title="Colour"
            description="HSL custom properties on :root, bridged to Tailwind through @theme inline."
          />
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {COLOUR_TOKENS.map((token) => (
              <li key={token.name} className="overflow-hidden rounded-lg border">
                <div className={`h-20 ${token.className}`} />
                <div className="p-3 text-sm">
                  <code className="font-semibold">{token.name}</code>
                  <p className="text-muted-foreground">{token.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad section-band">
        <div className="container-wide">
          <SectionHeading eyebrow="Typography" title="Type scale" />
          <div className="mt-10 space-y-6">
            <p className="display text-5xl">Display · Plus Jakarta Sans</p>
            <p className="display text-3xl">Section heading example</p>
            <p className="lede">Lede paragraph in Inter, muted foreground.</p>
            <p>Body text in Inter. Both fonts are placeholders until confirmed.</p>
            <Eyebrow>Eyebrow label</Eyebrow>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <SectionHeading eyebrow="Components" title="Buttons and navigation" align="center" />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/design" testId="link-design-primary">
              Primary
            </ButtonLink>
            <ButtonLink href="/design" variant="secondary" testId="link-design-secondary">
              Secondary
            </ButtonLink>
            <ButtonLink href="/contact" testId="link-design-lets-talk" noIcon>
              Let&apos;s talk
            </ButtonLink>
            <a href="/design" className="link-arrow focus-ring" data-testid="link-design-arrow">
              Text link →
            </a>
          </div>
          <nav aria-label="Navigation pill preview" className="mt-10 flex flex-wrap justify-center gap-1">
            <a href="/design" aria-current="page" className="nav-pill focus-ring" data-testid="link-design-nav-active">
              Home
            </a>
            <a href="/design" className="nav-pill focus-ring" data-testid="link-design-nav-about">
              About
            </a>
            <a href="/design" className="nav-pill focus-ring" data-testid="link-design-nav-services">
              Services
            </a>
          </nav>
        </div>
      </section>

      <section className="section-pad bg-accent text-accent-foreground">
        <div className="container-wide">
          <Eyebrow onDark>Accent band</Eyebrow>
          <p className="display mt-4 text-4xl">Accent background (unconfirmed colour)</p>
          <div className="mt-8">
            <ButtonLink href="/design" variant="secondary" onDark testId="link-design-on-dark">
              Secondary on dark
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
