import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { LogoImage } from "@/components/brand-logo";
import { Logo } from "@/components/public/logo";
import { heroSlides } from "@/data/content";
import { ButtonLink, Eyebrow, PageHero, SectionHeading } from "@/components/site";

// TEMPORARY design-system preview. Remove before launch (docs/TODO-content.md).

export const metadata: Metadata = {
  title: "Design system",
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

function Specimen({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <figure className={dark ? "design-specimen design-specimen-dark" : "design-specimen"}>
      <div className="design-specimen-stage">{children}</div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

const SAMPLE_IMAGE = heroSlides.find((slide) => slide.image.src)?.image.src ?? null;
const sampleImage = SAMPLE_IMAGE ? { src: SAMPLE_IMAGE, alt: "" } : null;
const sampleFacts = [
  { label: "Fact one", value: "Value" },
  { label: "Fact two", value: "Value" },
  { label: "Fact three", value: "Value" },
];
const sampleCrumbs = [{ label: "Section", href: "/design" }, { label: "Current page" }];
const sampleTabs = [
  { label: "First", href: "/design", active: true },
  { label: "Second", href: "/design#second" },
  { label: "Third", href: "/design#third" },
];

const HERO_SAMPLES: Array<{ key: string; node: React.ReactNode }> = [
  { key: "photo · with image + facts", node: <PageHero as="h2" variant="photo" breadcrumbs={sampleCrumbs} eyebrow="Eyebrow" title="Photo hero" image={sampleImage} facts={sampleFacts} actions={[{ label: "Action", href: "/design", testId: "link-design-photo-action" }]} /> },
  { key: "photo · no image (flat tile)", node: <PageHero as="h2" variant="photo" eyebrow="Eyebrow" title="Photo hero without an image" facts={sampleFacts.slice(0, 2)} /> },
  { key: "solid · primary with tabs", node: <PageHero as="h2" variant="solid" eyebrow="Eyebrow" title="Solid hero" description="One line of supporting text." tabs={sampleTabs} tabsLabel="Sample tabs" /> },
  { key: "solid · accent", node: <PageHero as="h2" variant="solid" tone="accent" eyebrow="Eyebrow" title="Solid accent hero" tabs={sampleTabs} tabsLabel="Sample tabs (accent)" /> },
  { key: "split · with image", node: <PageHero as="h2" variant="split" breadcrumbs={sampleCrumbs} eyebrow="01" title="Split hero" description="One line of supporting text." facts={sampleFacts.slice(0, 1)} image={sampleImage} /> },
  { key: "split · no image (flat tile)", node: <PageHero as="h2" variant="split" breadcrumbs={sampleCrumbs} eyebrow="02" title="Split hero without an image" facts={sampleFacts.slice(0, 1)} /> },
  { key: "compact · with tabs", node: <PageHero as="h2" variant="compact" eyebrow="Eyebrow" title="Compact hero" description="One line of supporting text." tabs={sampleTabs} tabsLabel="Sample filter" /> },
  { key: "article", node: <PageHero as="h2" variant="article" breadcrumbs={sampleCrumbs} eyebrow="Tag one · Tag two" title="Article hero" facts={[{ label: "Date", value: "1 January 2026" }, { label: "Source", value: "Source: Outlet" }]} /> },
];

export default function DesignPage() {
  return (
    <main>
      <PageHero
        variant="compact"
        eyebrow="Design system"
        title="Glovesly design foundation"
        description="Temporary preview of the final buttons, navigation states, hero variants and logo placements. ICAADA's patterns with the blue primary."
        actions={[
          { label: "Primary action", href: "/design", testId: "link-design-hero-primary" },
          { label: "Secondary action", href: "/design", variant: "secondary", testId: "link-design-hero-secondary" },
        ]}
      />

      {/* Hero variants ------------------------------------------------- */}
      <section className="section-pad" aria-labelledby="design-heroes">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Page hero"
            title={<span id="design-heroes">Hero variants</span>}
            description="Every PageHero variant, with and without an image. Headings are h2 here so this page keeps one h1. Sample text only."
          />
        </div>
      </section>
      {HERO_SAMPLES.map((sample) => (
        <div key={sample.key} className="design-hero-sample">
          <p className="container-wide design-hero-label">{sample.key}</p>
          {sample.node}
        </div>
      ))}

      {/* Logo ---------------------------------------------------------- */}
      <section className="section-pad">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Logo"
            title="Logo placements"
            description="public/brand/glovely-logo.png (500×500, white background). On dark backgrounds it sits on a white tile."
          />
          <div className="design-grid mt-10">
            <Specimen label="Public header (44px, priority, links to /)">
              <Logo testId="link-design-logo-header" />
            </Specimen>
            <Specimen label="Footer on dark (white tile)" dark>
              <Logo onDark testId="link-design-logo-footer" />
            </Specimen>
            <Specimen label="Admin sidebar (40px tile)" dark>
              <span className="flex items-center gap-3">
                <LogoImage size={40} tile alt="" />
                <span className="text-sm font-bold text-white">
                  Glovesly
                  <span className="block text-xs font-normal opacity-70">Admin workspace</span>
                </span>
              </span>
            </Specimen>
            <Specimen label="Admin login panel (56px tile on blue)">
              <span className="design-login-panel">
                <LogoImage size={56} tile alt="Glovesly Pro-Project" />
              </span>
            </Specimen>
            <Specimen label="Favicon and app icons (src/app/icon.png 256px, apple-icon.png 180px)">
              <span className="flex items-end gap-4">
                <Image src="/icon.png" alt="Favicon at 16px" width={16} height={16} />
                <Image src="/icon.png" alt="Favicon at 32px" width={32} height={32} />
                <Image src="/apple-icon.png" alt="Apple touch icon at 60px" width={60} height={60} />
              </span>
            </Specimen>
          </div>
        </div>
      </section>

      {/* Buttons -------------------------------------------------------- */}
      <section className="section-pad section-band">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Buttons"
            title="Buttons"
            description="Square corners, 48px minimum height, trailing ArrowRight. Primary lifts 2px and darkens on hover; secondary fills on hover."
          />
          <div className="design-grid mt-10">
            <Specimen label=".button-primary (hover: darker, lifts 2px)">
              <ButtonLink href="/design" testId="link-design-primary">
                Primary
              </ButtonLink>
            </Specimen>
            <Specimen label=".button-secondary (hover: fills blue)">
              <ButtonLink href="/design" variant="secondary" testId="link-design-secondary">
                Secondary
              </ButtonLink>
            </Specimen>
            <Specimen label=".button-secondary.button-on-dark" dark>
              <ButtonLink href="/design" variant="secondary" onDark testId="link-design-on-dark">
                Secondary on dark
              </ButtonLink>
            </Specimen>
            <Specimen label="<button> primary (contact form submit)">
              <button type="button" className="button-primary focus-ring" data-testid="button-design-submit">
                <span>Send message</span>
                <ArrowRight aria-hidden="true" className="button-icon" />
              </button>
            </Specimen>
            <Specimen label=".link-arrow (text link)">
              <a href="/design" className="link-arrow focus-ring" data-testid="link-design-arrow">
                Text link <ArrowRight aria-hidden="true" size={16} />
              </a>
            </Specimen>
          </div>
        </div>
      </section>

      {/* Navigation ------------------------------------------------------ */}
      <section className="section-pad">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Navigation"
            title="Navigation states"
            description="Small bold muted links; the active link (aria-current=&quot;page&quot;) gets a blue underline. Square “Let's talk ↗” CTA."
          />
          <div className="design-grid mt-10">
            <Specimen label="Desktop nav: default, active (aria-current), CTA">
              <nav aria-label="Navigation preview" className="flex flex-wrap items-center gap-1">
                <a href="/design" className="nav-link focus-ring" data-testid="link-design-nav-home">
                  Home
                </a>
                <a href="/design" aria-current="page" className="nav-link focus-ring" data-testid="link-design-nav-active">
                  About
                </a>
                <a href="/design" className="nav-link focus-ring" data-testid="link-design-nav-services">
                  Services
                </a>
                <a href="/contact" className="nav-cta focus-ring ml-2" data-testid="link-design-nav-cta">
                  <span>Let&apos;s talk</span>
                  <ArrowUpRight aria-hidden="true" className="nav-cta-icon" />
                </a>
              </nav>
            </Specimen>
            <Specimen label="Mobile: menu button (Menu / X icons)">
              <span className="flex gap-2">
                <span className="site-menu-button design-static" aria-hidden="true">
                  <Menu size={24} />
                </span>
                <span className="site-menu-button design-static" aria-hidden="true">
                  <X size={24} />
                </span>
              </span>
            </Specimen>
            <Specimen label="Mobile menu links (active underlined)">
              <ul className="w-full">
                <li>
                  <a href="/design" className="site-mobile-link focus-ring" data-testid="link-design-mobile-home">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/design" aria-current="page" className="site-mobile-link focus-ring" data-testid="link-design-mobile-active">
                    About
                  </a>
                </li>
              </ul>
            </Specimen>
            <Specimen label="Sector filter toggle (aria-pressed)">
              <span className="flex flex-wrap gap-2">
                <button type="button" className="filter-button focus-ring" aria-pressed="true" data-testid="button-design-filter-on">
                  All sectors <span className="filter-count">5</span>
                </button>
                <button type="button" className="filter-button focus-ring" aria-pressed="false" data-testid="button-design-filter-off">
                  Construction <span className="filter-count">2</span>
                </button>
              </span>
            </Specimen>
          </div>
        </div>
      </section>

      {/* Tokens and type ------------------------------------------------- */}
      <section className="section-pad section-band">
        <div className="container-wide">
          <SectionHeading eyebrow="Tokens" title="Colour" description="HSL custom properties on :root, bridged to Tailwind through @theme inline." />
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {COLOUR_TOKENS.map((token) => (
              <li key={token.name} className="overflow-hidden rounded-[var(--radius)] border bg-background">
                <div className={`h-20 ${token.className}`} />
                <div className="p-3 text-sm">
                  <code className="font-semibold">{token.name}</code>
                  <p className="text-muted-foreground">{token.note}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-14 space-y-6">
            <p className="display text-5xl">Display · Plus Jakarta Sans</p>
            <p className="lede">Lede paragraph in Inter, muted foreground. Both fonts are placeholders.</p>
            <Eyebrow>Eyebrow label</Eyebrow>
          </div>
        </div>
      </section>
    </main>
  );
}
