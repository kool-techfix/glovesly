# Glovesly Pro-Project: website redevelopment

Rebuild of gloveslyproject.com (WordPress with a predeveloped theme, currently served under `/wp/`) as a Next.js app with a CMS admin. Glovesly Pro-Project is a Nigerian company working in aviation infrastructure, construction, security solutions and energy solutions.

## Read first

1. `docs/reference/ARCHITECTURE.md` and `docs/reference/BRAND.md`. These describe the ICAADA project. This project copies its architecture, layering, admin pattern and conventions. Differences are listed in this file and win where they conflict.
2. `node_modules/next/dist/docs/`. Next 16 differs from older versions. Check it before changing routing, caching, rendering or config.

## Stack (pinned to ICAADA's versions so code can be ported as is)

| Tool | Version |
|---|---|
| Next.js (App Router) | 16.3.3 |
| React / React DOM | 19.2.8 |
| React Compiler | `babel-plugin-react-compiler` 1.0.0, `reactCompiler: true` |
| Cache Components | **Off.** Use `unstable_cache` + `revalidateTag(tag, { expire: 0 })` as in ARCHITECTURE.md §5.6 |
| TypeScript | ^5, `strict`, alias `@/* → src/*` |
| Tailwind CSS | v4 via `@tailwindcss/postcss` (not `@tailwindcss/turbopack`), no `tailwind.config` |
| Prisma | 7.10.0 with `@prisma/adapter-pg`, PostgreSQL |
| Auth | `jose` 6.2.12, `bcrypt` 6.0.0, server-side `Session` rows |
| Validation | `zod` ^3.25.76 |
| Email | `nodemailer` ^10 over SMTP |
| Media | Cloudinary signed direct upload |
| Package manager | pnpm 10.14.0 (do not upgrade) |

## Differences from ICAADA

- **Brand:** blue primary replaces the red accent (see Brand tokens). Buttons, navigation, header and card styling are ICAADA's (square corners, underline on the active nav link, trailing-arrow buttons, "Let's talk ↗" nav CTA), not the old Glovesly theme's pill style.
- **Logo:** the real Glovesly logo image (`public/brand/`) is used in the header, footer, admin and favicon. Do not draw a CSS brand mark like ICAADA's "IC" square.
- **Buttons and navigation follow ICAADA exactly** (BRAND.md sections 4 and 5), with the blue primary in place of the red accent. Square corners, no radius on buttons, the nav CTA or the brand mark. Primary button: filled primary, white text, trailing `ArrowRight`, lifts 2px on hover, darker primary on hover, minimum 48px tall. Secondary button: primary-text outline (charcoal in ICAADA) that fills on hover, white outline variant on dark or hero backgrounds. Header: fixed, 80px, white at 96% opacity with a 10px backdrop blur. Nav links: small bold text (about 0.76 to 0.82rem), muted grey, with an underline in the primary colour on the active link and `aria-current="page"`. Nav CTA: filled primary with a trailing arrow icon, hover uses the darker primary. Mobile menu uses the `Menu` / `X` icons. Do not reproduce the old Glovesly pill-shaped nav or rounded "Let's Talk!" button.
- **Modules:** `Service`, `Project`, `NewsPost`, `TeamMember`, `Partner` are the content modules. There is no Event, Voice, Program, Volunteer or Newsletter module.
- **New public sections:** a Clients & Partners carousel section and a Nigeria map section (static SVG, no map tiles or API keys).
- **Project location:** each `Project` has a `state` (a string validated against the list in `src/lib/nigeria-states.ts`: 36 states plus FCT) and optional latitude and longitude.
- **Workspace settings** also hold the office locations and the stats shown beside the map.

## Routes

Public: `/`, `/about`, `/services`, `/services/[slug]`, `/projects`, `/projects/[slug]`, `/news`, `/news/[slug]`, `/our-team`, `/contact`.
Admin: `/admin/login` and `/admin/**` (session-guarded). API: `/api/auth`, `/api/public`, `/api/admin`, as in ARCHITECTURE.md §5.3.

Old WordPress URLs get permanent redirects in `next.config.ts`: `/wp` → `/`, `/wp/about` → `/about`, `/wp/services` → `/services`, `/wp/projects` → `/projects`, `/wp/our-team` → `/our-team`, `/wp/lavarai` → `/news`, `/wp/contact` → `/contact`. Verify each old path against the WordPress export before shipping.

## Brand tokens

Light theme only. Define as HSL custom properties on `:root` and bridge with `@theme inline`, as in BRAND.md §2.

| Token | Value | Role |
|---|---|---|
| `--primary` / `--ring` | `#1E73BE` | Buttons, active nav underline, links, focus ring, eyebrows on light backgrounds |
| `--primary-hover` | `#175C97` | Hover and pressed |
| `--navy` | `#0B2A4A` | Dark bands: map section, closing/CTA bands, footer, solid hero, carousel and image fallbacks. White text |
| `--navy-soft` | `#1A4570` | Inactive shapes on navy (map states without projects) |
| `--accent` | `#F5A400` (amber) | Small things only: eyebrows and markers on navy, map project states, active dots and underlines, loader marker, small tags. Never large fills; text on amber is navy |
| `--accent-ink` | `#8A5300` | Warm text on light backgrounds (never amber text on white or `#F8F8F8`) |
| `--on-dark-link` | `#7FBBEA` | Links on navy |
| `--background` | `#FFFFFF` | Page |
| `--secondary` | `#F8F8F8` | Section bands |
| `--foreground` | near-black | Body text |
| `--muted-foreground` | `#505858` | Secondary text |
| `--border` | light grey | Hairlines |

Fonts are not decided yet. Use `next/font/google` behind CSS variables (`--app-font-sans`, `--app-font-display`) so they can be swapped in one place. Admin styles live under `.admin-*` / `.adm-*` with their own `--admin-*` variables, same blue primary and a neutral palette; amber is used only for "review" status chips.

## Conventions (from ARCHITECTURE.md §5.1 and §8)

- Layering is strict: Route Handler → Guard → Service → Repository → Prisma. Only `src/Repositories/` and `src/lib/prisma.ts` (and `prisma/seed.ts`) import Prisma. The folders are named exactly `Services`, `Repositories`, `Schemas`.
- kebab-case file names. `cn()` from `@/lib/utils` for class merging. Absolute `@/` imports.
- Every interactive element gets a `data-testid` in the form `<kind>-<area>-<name>`.
- Accessibility: `.focus-ring`, ARIA on carousels, tabs, menus and the map, `prefers-reduced-motion` respected, 48px touch targets.
- Public pages are Server Components with ISR (`revalidate = 3600`) reading the services directly. Interactive leaves are client components that receive DTOs as props.
- Sentence-case headings and buttons. British/Nigerian English spelling.
- No gradients. Solid colours from the token set only. `pnpm check:gradients` enforces this for `src/`.

## Content rules

- **Never invent company facts.** Client names, project names, states worked in, statistics, team members and office addresses come from the owner or from the WordPress export. Where something is missing, use an obviously fake placeholder (for example "Sample Client") and list it in `docs/TODO-content.md`.
- Do not reuse any text, image or link that still points to the old theme provider.

## Workflow

- Work in small steps and commit after each one with a clear message.
- After each step run `pnpm exec tsc --noEmit` and `pnpm lint`. Run `pnpm build` after steps that change routes, config or the schema.
- If a pnpm fetch fails with `ECONNRESET`, retry. Do not change the registry or the pnpm version.
- Ask before adding a dependency that is not listed here.
- Secrets live in `.env` (git-ignored). Keep `.env.example` current.
