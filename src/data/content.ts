import type { ProjectSector } from "@/lib/domain";

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

export const home = {
  hero: {
    eyebrow: siteName,
    title: "Placeholder headline from the owner",
    description: companySummary,
    primaryCta: { href: "/services", label: "Explore our services" },
    secondaryCta: { href: "/contact", label: ctaLabel },
  },
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
