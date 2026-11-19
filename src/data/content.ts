import type { PartnerType, ProjectSector } from "@/lib/domain";

/*
 * Page copy that editors do not manage in the admin.
 *
 * Only `companySummary` is a confirmed fact (from the project brief). Every
 * other string is a PLACEHOLDER and says so. Replace them with the owner's
 * copy; the full list is in docs/TODO-content.md.
 */

export const siteName = "Glovesly Pro-Project";

/** Confirmed in the project brief (CLAUDE.md). */
export const companySummary =
  "Glovesly Pro-Project is a Nigerian company working in aviation infrastructure, construction, security solutions and energy solutions.";

export type NavItem = { href: string; label: string; key: string };

export const mainNav: NavItem[] = [
  { href: "/", label: "Home", key: "home" },
  { href: "/about", label: "About", key: "about" },
  { href: "/services", label: "Services", key: "services" },
  { href: "/projects", label: "Projects", key: "projects" },
  { href: "/news", label: "News", key: "news" },
  { href: "/contact", label: "Contact", key: "contact" },
];

export const footerNav: NavItem[] = [...mainNav.slice(1, 5), { href: "/our-team", label: "Our team", key: "our-team" }, mainNav[5]!];

export const ctaLabel = "Let's talk";

/** The four sectors named in the brief. Descriptions are placeholders. */
export const sectors: Array<{ key: ProjectSector; title: string; description: string }> = [
  {
    key: "AVIATION",
    title: "Aviation infrastructure",
    description: "Placeholder: one or two sentences from the owner about the company's aviation infrastructure work.",
  },
  {
    key: "CONSTRUCTION",
    title: "Construction",
    description: "Placeholder: one or two sentences from the owner about the company's construction work.",
  },
  {
    key: "SECURITY",
    title: "Security solutions",
    description: "Placeholder: one or two sentences from the owner about the company's security solutions.",
  },
  {
    key: "ENERGY",
    title: "Energy solutions",
    description: "Placeholder: one or two sentences from the owner about the company's energy solutions.",
  },
];

/* ------------------------------------------------------------------
   Home hero slideshow (HeroCarousel)
   ------------------------------------------------------------------ */

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  /** `src: null` = no photo yet. The slide shows a solid accent background until one is supplied. */
  image: { src: string | null; alt: string };
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

/**
 * Slide 1 uses the current site's headline and strapline (confirm the full
 * sentence against the WordPress export). Slides 2 to 4 are one per business
 * line; their summaries are PLACEHOLDERS because the seeded services only have
 * placeholder descriptions.
 *
 * A primary CTA pointing at `/services/<slug>` falls back to `/services` on the
 * home page until a published service with that slug exists
 * (see `resolveHeroSlides` in src/app/(public)/page.tsx).
 *
 * TODO(content): one landscape photo per slide, at least 1920px wide, uploaded
 * to Cloudinary (docs/TODO-content.md). Alt text is already written below.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "vision",
    eyebrow: siteName,
    title: "Your vision, our expertise",
    text: "Providing solutions around the globe in aviation infrastructure, construction, security and energy.",
    image: { src: null, alt: "Placeholder: describe the hero photo once it is supplied." },
    primaryCta: { label: "Our services", href: "/services" },
    secondaryCta: { label: "Contact us", href: "/contact" },
  },
  {
    id: "aviation",
    eyebrow: "What we do",
    title: "Aviation infrastructure",
    text: "Placeholder: one sentence from the owner summarising the aviation infrastructure service.",
    image: { src: null, alt: "Placeholder: describe the aviation infrastructure photo once it is supplied." },
    primaryCta: { label: "About this service", href: "/services/aviation-infrastructure" },
    secondaryCta: { label: "View projects", href: "/projects" },
  },
  {
    id: "construction",
    eyebrow: "What we do",
    title: "Construction",
    text: "Placeholder: one sentence from the owner summarising the construction service.",
    image: { src: null, alt: "Placeholder: describe the construction photo once it is supplied." },
    primaryCta: { label: "About this service", href: "/services/construction" },
    secondaryCta: { label: "View projects", href: "/projects" },
  },
  {
    id: "security",
    eyebrow: "What we do",
    title: "Security solutions",
    text: "Placeholder: one sentence from the owner summarising the security solutions service.",
    image: { src: null, alt: "Placeholder: describe the security solutions photo once it is supplied." },
    primaryCta: { label: "About this service", href: "/services/security-solutions" },
    secondaryCta: { label: "View projects", href: "/projects" },
  },
  {
    id: "energy",
    eyebrow: "What we do",
    title: "Energy solutions",
    text: "Placeholder: one sentence from the owner summarising the energy solutions service.",
    image: { src: null, alt: "Placeholder: describe the energy solutions photo once it is supplied." },
    primaryCta: { label: "About this service", href: "/services/energy-solutions" },
    secondaryCta: { label: "View projects", href: "/projects" },
  },
];

export const home = {
  sectors: {
    eyebrow: "Sectors",
    title: "Four sectors, one partner",
    description: "Placeholder: a short introduction to how the four sectors fit together.",
  },
  services: {
    eyebrow: "What we do",
    title: "Our services",
    description: "Placeholder: a sentence introducing the services.",
  },
  projects: {
    eyebrow: "Our work",
    title: "Selected projects",
    description: "Placeholder: a sentence introducing the projects.",
  },
  partners: {
    eyebrow: "Clients and partners",
    title: "Who we work with",
    description: "Placeholder: one sentence about the organisations the company works with.",
  },
  map: {
    eyebrow: "Across Nigeria",
    title: "Where we work",
    description: "Placeholder: one sentence about the company's reach across Nigeria.",
  },
  news: {
    eyebrow: "News",
    title: "Latest updates",
  },
};

export const about = {
  hero: {
    eyebrow: "About us",
    title: "Placeholder: who Glovesly Pro-Project is",
    description: companySummary,
  },
  story: {
    eyebrow: "Our story",
    title: "Placeholder: company story heading",
    paragraphs: [
      "Placeholder: the company's history (founding year, founders, milestones) supplied by the owner.",
      "Placeholder: a second paragraph about how the company works today.",
    ],
  },
  missionVision: [
    { title: "Our mission", text: "Placeholder: the owner's mission statement." },
    { title: "Our vision", text: "Placeholder: the owner's vision statement." },
  ],
  values: {
    eyebrow: "What we value",
    title: "Our values",
    items: [
      { title: "Placeholder value one", text: "Placeholder: one sentence explaining this value." },
      { title: "Placeholder value two", text: "Placeholder: one sentence explaining this value." },
      { title: "Placeholder value three", text: "Placeholder: one sentence explaining this value." },
    ],
  },
  team: {
    eyebrow: "Our people",
    title: "Meet the team",
    description: "Placeholder: a sentence introducing the leadership team.",
  },
  partners: {
    eyebrow: "Clients and partners",
    title: "Who we work with",
  },
};

/* ------------------------------------------------------------------
   Message from the CEO (About page, optional home teaser)
   ------------------------------------------------------------------ */

/** Supplied by the owner. Keep the wording verbatim; it is a quotation. */
export const ceoMessage = {
  id: "ceo-message",
  eyebrow: "Leadership",
  title: "Message from the CEO",
  paragraphs: [
    "Drawing on my years with Glovesly, my goal has been to build upon the remarkable progress we’ve made in diversifying our capabilities and offerings. This journey aims to expand opportunities and deliver greater value to our clients, shareholders, and employees.",
    "Since assuming this role, I’ve cherished the opportunity to connect with many of our clients and visit projects and offices worldwide. Witnessing our team’s dedication and the tangible impact of our solutions continues to inspire me. Together, we are making a positive difference today while shaping a better future for the world.",
  ],
  name: "Yasir Tijjani Abdullahi",
  role: "CEO",
  /** TODO(content): portrait of the CEO (Cloudinary URL, at least 1200px). Null hides the photo column. */
  photo: null as { src: string; alt: string } | null,
  /** Short excerpt for the home teaser, taken verbatim from the message. */
  excerpt: "Together, we are making a positive difference today while shaping a better future for the world.",
};

/** Home page teaser linking to the full message. Set to false to remove it. */
export const showCeoTeaserOnHome = true;

export const pageIntros = {
  services: {
    eyebrow: "Services",
    title: "Placeholder: services page headline",
    description: "Placeholder: an introduction to the company's services.",
  },
  projects: {
    eyebrow: "Projects",
    title: "Placeholder: projects page headline",
    description: "Placeholder: an introduction to the company's projects across Nigeria.",
  },
  news: {
    eyebrow: "News",
    title: "News and updates",
    description: "Placeholder: a sentence introducing the news page.",
  },
  team: {
    eyebrow: "Our team",
    title: "The people behind our work",
    description: "Placeholder: a sentence introducing the team.",
  },
  contact: {
    eyebrow: "Contact",
    title: ctaLabel,
    description: "Placeholder: a sentence inviting enquiries and saying how quickly the team replies.",
  },
};

export const ctaBand = {
  title: "Have a project in mind?",
  description: "Placeholder: one sentence inviting visitors to get in touch.",
  cta: { href: "/contact", label: ctaLabel },
};

export const contactForm = {
  title: "Send us a message",
  success: "Thank you. Your message has been sent and the team will be in touch.",
};

/**
 * One row per partner type in the Clients & Partners section. Types are
 * PROVISIONAL (see PartnerType); titles and descriptions are placeholders.
 */
export const partnerGroups: Record<PartnerType, { title: string; description: string }> = {
  GOVERNMENT: {
    title: "Government",
    description: "Placeholder: one line about the government bodies the company works with.",
  },
  PRIVATE_CLIENT: {
    title: "Private clients",
    description: "Placeholder: one line about the company's private-sector clients.",
  },
  TECHNOLOGY_PARTNER: {
    title: "Technology partners",
    description: "Placeholder: one line about the company's technology partners.",
  },
};

