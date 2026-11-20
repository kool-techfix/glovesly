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
  /** Leave empty on a service slide: the text comes from that service's summary. */
  text: string;
  /** Service slides: the text is that service's summary, the primary CTA its page. */
  serviceSlug?: string;
  /** `src: null` = no photo yet. The slide shows a solid accent background until one is supplied. */
  image: { src: string | null; alt: string };
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

/**
 * Slide 1 uses the current site's headline and strapline (confirm the full
 * sentence against the WordPress export). Slides 2 to 5 are one per service:
 * on the home page each takes its text from the service's summary (edited in
 * the admin) and links to /services/<serviceSlug>. If the service is not
 * published the link falls back to /services; if it has no summary (Energy
 * Solutions, for now) the slide shows no text
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
    text: "",
    serviceSlug: "aviation",
    image: { src: null, alt: "Placeholder: describe the aviation infrastructure photo once it is supplied." },
    primaryCta: { label: "About this service", href: "/services/aviation" },
    secondaryCta: { label: "View projects", href: "/projects" },
  },
  {
    id: "construction",
    eyebrow: "What we do",
    title: "Construction",
    text: "",
    serviceSlug: "construction",
    image: { src: null, alt: "Placeholder: describe the construction photo once it is supplied." },
    primaryCta: { label: "About this service", href: "/services/construction" },
    secondaryCta: { label: "View projects", href: "/projects" },
  },
  {
    id: "security",
    eyebrow: "What we do",
    title: "Security solutions",
    text: "",
    serviceSlug: "security-solutions",
    image: { src: null, alt: "Placeholder: describe the security solutions photo once it is supplied." },
    primaryCta: { label: "About this service", href: "/services/security-solutions" },
    secondaryCta: { label: "View projects", href: "/projects" },
  },
  {
    id: "energy",
    eyebrow: "What we do",
    title: "Energy solutions",
    text: "",
    serviceSlug: "energy-solutions",
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

/* ------------------------------------------------------------------
   About page. All copy below is from the current gloveslyproject.com
   About page, supplied by the owner. Keep it verbatim: do not rewrite,
   shorten or correct it.
   ------------------------------------------------------------------ */

export type ContentImage = { src: string; alt: string } | null;

export type AboutPage = {
  hero: {
    eyebrow: string;
    title: string;
    /** TODO(content): team photo (branded caps) from the old About page. */
    image: ContentImage;
    cta: { href: string; label: string };
  };
  meta: { title: string };
  /** Year stated in paragraphs[0]. */
  founded: string;
  /** [0] who we are, [1] how we work, [2] what we deliver. */
  paragraphs: [string, string, string];
  sections: { whoWeAre: string; howWeWork: string; whatWeDeliver: string };
  /** TODO(content): the second photo from the old About page. */
  howWeWorkImage: ContentImage;
  /** Taken from paragraphs[2]. */
  portfolio: string[];
  vision: { title: string; text: string };
  mission: { title: string; text: string };
  closing: ClosingBandContent;
};

export const aboutPage: AboutPage = {
  hero: {
    eyebrow: "About us",
    title: "Our Journey in Construction, Your Path to Satisfaction",
    image: null,
    cta: { href: "/our-team", label: "Meet our team" },
  },
  meta: { title: "About us" },
  founded: "2016",
  paragraphs: [
    "GLOVESLY Pro-Project was founded in 2016 with the aim of filling the vacuum in Aviation industry, civil construction and also provide Security solutions using modern Surveillance Equipment. The challenging and growing requirements in the Aviation industry, new technologies and new demands for security and modernization constantly emerge, this means expansion, renovation and new construction of airports and airport facilities. Such a dynamic industry requires a construction company with deep aviation expertise, which is why so many in the industry turn to Glovesly. Our aviation construction services are delivered with an approach that combines design, engineering and precision in one streamlined process that prioritizes safety over all.",
    "Glovesly Pro-Project Ltd found success working with public and private clients in the aviation sector by repeatedly executing projects of all sizes and delivery methods. As a valued stakeholder invested in sharing visions for the future, our collaborative approach to airside and landside projects serves as a key differentiator with airport authorities, and fixed-base operators. The expertise and creativity our team provides helps drive decisions to elevate the overall passenger experience, passenger safety and the facilities’ lifecycle, all while prioritizing design to ensure construction deliverables are achieved to the client’s desirable levels without impacting day-to-day operations. For these reasons and more, Glovesly Pro-Project Ltd has earned a reputation as one of the top Aviation contractors in the country today.",
    "Our balanced portfolio includes everything from terminals, Aprons, Taxi Ways, Security Surveillance systems, Disabled Aircraft Recovery Equipment, and Fire/Smoke Simulators and Range of other Safety Equipment and Services. We firmly understand the regulations for aviation facilities (including military and federal installations) and embrace opportunities to uncover solutions to challenges that are burdensome to clients, airlines and passengers. Because of this knowledge, passion and customer-focused approach, we have become an emerging leader in aviation construction to upgrade aging infrastructure and build new, world-class airports focused on enhancing the overall passenger experience. We made a successful entry into the local and international market by actively participating in tenders for special equipment, Civil Construction, thus making a significant contribution to the industry.",
  ],
  sections: { whoWeAre: "Who we are", howWeWork: "How we work", whatWeDeliver: "What we deliver" },
  howWeWorkImage: null,
  portfolio: [
    "Terminals",
    "Aprons",
    "Taxiways",
    "Security surveillance systems",
    "Disabled aircraft recovery equipment",
    "Fire/smoke simulators",
    "Other safety equipment and services",
  ],
  vision: {
    title: "Our vision",
    text: "We strive to be high value player in all our business concerns, by ensuring a total quality service as well as safety of personnel equipment and environment while providing solutions to our client’s door steps.",
  },
  mission: {
    title: "Our mission",
    text: "GLOVESLY PRO-PROJECT LIMITED Mission is “to provide services and products of superior quality and value, that improves our clients and people all over the world while delivering profits to our shareholders with high commitment to their philosophy and ensuring safety in actualizing their dream”.",
  },
  closing: {
    title: "Let's work together",
    primaryCta: { href: "/contact", label: ctaLabel },
    secondaryCta: { href: "/our-team", label: "Meet our team" },
  },
};

/** First sentence of paragraphs[0], used as the page's meta description. */
export const aboutMetaDescription = aboutPage.paragraphs[0].slice(0, aboutPage.paragraphs[0].indexOf(". ") + 1);

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
  // From the current site's Services page (owner copy, verbatim).
  services: {
    eyebrow: "Our services",
    title: "We provide solutions around the globe.",
    description: "Our Journey, Your Path to Satisfaction",
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

export type ClosingBandContent = {
  title: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
};

/** Closing band on /services and every /services/[slug]. */
export const servicesClosing: ClosingBandContent = {
  title: "Need a solution for your project?",
  primaryCta: { href: "/contact", label: ctaLabel },
  secondaryCta: { href: "/projects", label: "View projects" },
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

