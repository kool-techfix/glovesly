# Claude Code prompts: Glovesly build

## Before you start

1. Put `CLAUDE.md` in the repo root.
2. Create `docs/reference/` and copy ICAADA's `ARCHITECTURE.md` and `BRAND.md` into it.
3. Run the prompts below **in order, one per Claude Code session**. After each one, review the diff, run the app, and commit before moving on.
4. Prompts 2 to 9 assume the previous ones are done.

---

## Prompt 1: Align the scaffold with ICAADA

```
Read CLAUDE.md, then docs/reference/ARCHITECTURE.md sections 1, 2, 7, 8 and 9.

The repo was created with create-next-app and installed Next 16.4.6, React 19.3.0 and @tailwindcss/turbopack, with no React Compiler. Align it with ICAADA's tooling:

1. Pin next to 16.3.3, react and react-dom to 19.2.8, eslint-config-next to 16.3.3.
2. Remove @tailwindcss/turbopack. Add @tailwindcss/postcss ^4, @tailwindcss/typography ^0.5.15 and tw-animate-css ^1.4.0, keep tailwindcss ^4, and create postcss.config.mjs using the @tailwindcss/postcss plugin.
3. Enable the React Compiler: add babel-plugin-react-compiler 1.0.0 as a dev dependency and set reactCompiler: true in next.config.ts. Make sure Cache Components is NOT enabled.
4. Install runtime dependencies: @prisma/client 7.10.0, @prisma/adapter-pg 7.10.0, bcrypt 6.0.0, jose 6.2.12, nodemailer ^10.0.16, zod ^3.25.76, react-hook-form ^7.55.0, @hookform/resolvers ^3.10.0, class-variance-authority ^0.7.1, clsx ^2.1.1, tailwind-merge ^3.3.1, lucide-react ^0.545.0, sonner ^2.0.7, date-fns ^3.6.0, embla-carousel-react ^8.6.0.
   Dev dependencies: prisma 7.10.0, @types/bcrypt 6.0.0, dotenv ^18.0.6, tsx ^4.23.15.
   Do not install the full Radix set now; add individual @radix-ui packages only when a component needs one.
5. Create pnpm-workspace.yaml allowing build scripts for prisma, bcrypt and esbuild.
6. Add src/lib/utils.ts exporting cn() (clsx + tailwind-merge).
7. Check tsconfig.json: strict, bundler resolution, "@/*" -> "src/*".
8. Replace the default create-next-app page, styles and assets with a blank page that renders "Glovesly" so the build is clean.

Verify with pnpm exec tsc --noEmit, pnpm lint and pnpm build. Commit as "chore: align scaffold with ICAADA tooling". Report any version that would not install instead of substituting another.
```

---

## Prompt 2: Brand tokens, fonts, root layout

```
Read CLAUDE.md (Brand tokens, Conventions) and docs/reference/BRAND.md sections 2 to 5.

Create the design foundation:
1. src/app/globals.css with: @import "tailwindcss"; the tw-animate-css and typography plugins; a :root block of HSL custom properties for the Glovesly tokens (primary #1e73be, a darker primary-hover, accent about #463DE1, background, secondary #F8F8F8, foreground, muted-foreground #505858, border, ring); and an @theme inline block bridging them to Tailwind colours, radius and fonts, as BRAND.md does.
2. Fonts through next/font/google in src/app/layout.tsx, exposed as --app-font-sans and --app-font-display. Use Inter for body and Plus Jakarta Sans for display as temporary choices, and note in a comment that they are placeholders to be confirmed.
3. Root layout: <html lang="en">, metadata with a title template "%s · Glovesly Pro-Project" and a short description, globals.css import.
4. Reusable, hook-free building blocks in src/components/site.tsx: Eyebrow, ButtonLink (primary and secondary, trailing arrow icon), PageHero, SectionHeading. Follow BRAND.md section 5 patterns, but use the blue primary and the rounded pill nav/CTA style of the current Glovesly site (pill-shaped active nav item, rounded "Let's talk" button) instead of ICAADA's square corners.
5. Add .focus-ring, .container-wide, .section-pad, .reveal animations (respect prefers-reduced-motion) as in BRAND.md.
6. A temporary /design page (remove later) showing all tokens, buttons, eyebrow and PageHero.

Verify with tsc, lint and build. Commit.
```

---

## Prompt 3: Environment, Prisma schema, migration

```
Read docs/reference/ARCHITECTURE.md sections 5.1, 5.2, 5.5, 5.8 and 9, and CLAUDE.md (Differences from ICAADA).

1. Environment:
   - src/lib/env.ts: Zod-validated getEnv() checking formats, not just presence (Postgres URLs for DATABASE_URL and DIRECT_URL, SESSION_SECRET of at least 32 characters, CLOUDINARY_CLOUD_NAME pattern, numeric CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, SMTP_* and EMAIL_FROM optional, APP_URL, optional DATABASE_POOL_MAX).
   - src/instrumentation.ts validating env once at boot.
   - .env.example documenting every variable. Make sure .env is git-ignored.
2. Prisma 7 (adapter-pg), following ICAADA: prisma.config.ts (schema, migrations path, seed command, DIRECT_URL), src/lib/prisma.ts singleton using DATABASE_URL via @prisma/adapter-pg, generator output at src/generated/prisma (git-ignored).
3. prisma/schema.prisma with these models. Every content model has: id cuid, slug @unique, status ContentStatus (DRAFT, REVIEW, PUBLISHED, ARCHIVED), publishedAt, sortOrder, createdAt, updatedAt, and @@index([status, sortOrder]). Media columns hold a Cloudinary URL plus a *PublicId. Every relation sets an explicit onDelete.
   - User (role ADMIN/EDITOR, status ACTIVE/DISABLED, passwordHash nullable until invite accepted, preferences Json), Session, PasswordToken, ActivityLog, WorkspaceSettings (single row id "workspace": contactEmail, phone, address, officeLocations Json [{name, state, latitude?, longitude?, isHeadOffice}], stats Json [{label, value}]).
   - Service: title, summary, body, capabilities String[], imageUrl, imagePublicId.
   - Project: title, summary, body, sector ProjectSector (AVIATION, CONSTRUCTION, SECURITY, ENERGY), client, locationLabel, state String, latitude Float?, longitude Float?, year Int?, projectStatus ProjectStatus (ONGOING, COMPLETED), coverImageUrl, coverImagePublicId, galleryUrls String[], galleryPublicIds String[].
   - NewsPost: title, excerpt, body, coverImageUrl, coverImagePublicId, authorId -> User (SetNull), tags String[].
   - TeamMember: name, role, bio, photoUrl, photoPublicId, linkedinUrl?.
   - Partner: name, logoUrl, logoPublicId, websiteUrl?, type PartnerType (provisional values GOVERNMENT, PRIVATE_CLIENT, TECHNOLOGY_PARTNER; mark in a comment that these await the owner's final groups).
   - ContactMessage: name, email, phone?, company?, subject?, message, status NEW/READ/ARCHIVED, replyDraft?, createdAt. No slug/publish workflow.
4. src/lib/nigeria-states.ts exporting the 36 states plus FCT as a const array and a Zod enum helper.
5. Add package.json scripts from ICAADA (postinstall prisma generate, db:generate, db:migrate, db:deploy, db:seed, db:studio).
6. Create the first migration. If no DATABASE_URL is available in this session, write the schema and stop before migrating, and tell me which command to run.

Verify with tsc and lint. Commit.
```

---

## Prompt 4: Shared backend infrastructure

```
Read docs/reference/ARCHITECTURE.md sections 5.1, 5.3, 5.5 and 5.8 in full.

Build the infrastructure used by every module, porting ICAADA's design (rewrite from the doc; do not invent a different structure):
- src/lib/api/: api-error, response (ok/handle with the { data, meta } and { error } shapes), request (Zod parse helpers), content-routes factories (adminCollectionRoutes, adminItemRoutes, adminStatusRoute, publicListRoute, publicSlugRoute).
- src/lib/auth/: session (jose HS256 JWT whose jti is the Session row id), cookies (httpOnly, sameSite lax, secure in production, cookie name glovesly_session), password (bcrypt), tokens (reset/invite, SHA-256 hashed, single use), auth-guard (requireAuth, requireEditor, requireAdmin, resolveSession re-checking the database on every request).
- src/lib/cache.ts: unstable_cache wrappers and revalidateContent() using revalidateTag(tag, { expire: 0 }) plus revalidatePath.
- src/lib/rate-limit.ts (in-memory fixed window), src/lib/cloudinary.ts (upload signature helper), src/lib/slug.ts (slugify, uniqueSlug), src/lib/email/ (mailer.ts and templates.ts, branded, escaped HTML + text).
- src/Repositories/repository-utils.ts (ContentRepository interface, withPrismaErrors mapping unique -> 409, missing -> 404, bad FK -> 422).
- src/Schemas/common.schema.ts (domain enums mirroring Prisma, contentBaseShape, text() helper, cloudinaryUrl, optionalPublicId).
- src/Services/content.service.ts: createContentService() handling listing, slugs, status transitions (DRAFT -> REVIEW or PUBLISHED; REVIEW -> PUBLISHED or DRAFT; PUBLISHED -> ARCHIVED or DRAFT; ARCHIVED -> DRAFT), publishedAt-on-first-publish, activity logging and revalidation.
- Auth services and routes: login (rate limited, constant-time dummy compare), logout, me, password forgot/check/reset, users (ADMIN only) with the self-protection rules from section 5.5.

Verify with tsc and lint, then run the check from section 11 step 8 (no @/lib/prisma imports outside Repositories). Write a short README section listing what exists. Commit.
```

---

## Prompt 5: Content modules (API only)

```
Read docs/reference/ARCHITECTURE.md section 11 ("How to add a new content module") and follow it exactly for each of: team, news, services, projects, partners.

For each module add the Zod schema, repository, service (DTO with ISO date strings), and the admin and public route files built from the factories. Publish rules in each service:
- Team: photo required.
- News: cover image required.
- Services: image and at least one capability required.
- Projects: cover image, sector and state required.
- Partners: logo required.
Media URLs must be on res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/. Add each module to ContentModule and publicPaths in src/lib/cache.ts. Add public detail routes (slug) for news, services and projects.

Also add: ContactMessage (public POST with honeypot field "company"... use a different honeypot name such as "website_url" because "company" is a real field here; per-IP rate limit; always 202; staff alert email to the workspace contact email) and admin inbox routes; WorkspaceSettings get/update (ADMIN only, EDITOR read-only); media sign-upload route; GET /api/admin/summary for header counts.

Write an idempotent prisma/seed.ts creating the two dev users and a few clearly fake placeholder rows for each module (names like "Sample Project"). Verify with tsc and lint. Commit.
```

---

## Prompt 6: Admin workspace

```
Read docs/reference/ARCHITECTURE.md section 6 and docs/reference/BRAND.md (admin palette).

Build the admin as ICAADA does, adapted to this project:
- app/admin/(auth)/login, forgot-password and reset-password pages; app/admin/(workspace)/layout.tsx server gate; AdminProvider/useAdmin store; admin-layout (sidebar + header).
- components/admin/: fields-form, module-configs, module-manager, module-page, admin-parts, and lib/admin/ helpers (api-client, use-admin-list, field-values, cloudinary-upload, format).
- ModuleConfig entries for services, projects, news, team and partners. Projects need a select field for sector, a select for state (from nigeria-states.ts), project status, optional latitude/longitude number fields, and a gallery field (multiple asset URLs). Services need a "lines" field for capabilities. Add a select field kind to ModuleManager if it does not support one yet.
- Dashboard (counts + recent activity), Messages inbox, Users (ADMIN only), Settings (contact details, office locations, map stats).
- Admin styling isolated under .admin-* / .adm-* with --admin-* variables, blue primary.
- Flag projects with no state so editors notice them.

Verify with tsc, lint and build, and sign in with the seeded admin to check each screen. Commit.
```

---

## Prompt 7: Public site shell and core pages

```
Read docs/reference/ARCHITECTURE.md sections 3 and 4 and CLAUDE.md.

Build the public site under src/app/(public)/:
- layout: fixed header with the logo (placeholder until the real logo file is supplied), nav (Home, About, Services, Projects, News, Contact) with a pill-shaped active item matching the current site, "Let's talk" CTA linking to /contact, mobile menu, footer. Split the nav into its own client component so the layout stays a server component.
- Pages (Server Components, revalidate = 3600, services called directly): /, /about, /services, /services/[slug], /projects, /projects/[slug], /news, /news/[slug], /our-team, /contact with a ContactForm posting to /api/public/contact, showing server field errors inline.
- Detail pages export generateStaticParams, generateMetadata and call notFound() for unknown or unpublished slugs.
- Page copy that editors do not manage lives in src/data/content.ts. Use placeholder copy and list what the owner must supply in docs/TODO-content.md.
- Per-page metadata, sitemap.ts and robots.ts.

Verify with tsc, lint, build, and click through every route. Commit.
```

---

## Prompt 8: Clients & Partners carousels and Nigeria map

```
Read CLAUDE.md (Differences from ICAADA).

1. Clients & Partners section on the home page:
   - Rows grouped by Partner.type, each with a title and one-line description (copy in content.ts) on the left and a logo strip on the right, in rounded bordered logo cards.
   - The strip is a CSS infinite-scroll marquee: duplicated track, soft fade edges via mask-image, pauses on hover and focus-within, stops entirely under prefers-reduced-motion. No JavaScript is needed, so keep it a Server Component. Use next/image with the Cloudinary allow-list and meaningful alt text. Hide empty groups.
2. Nigeria map section:
   - Add a one-off script (scripts/build-nigeria-map.ts, run with tsx) that downloads open state-boundary GeoJSON for Nigeria (geoBoundaries ADM1 or Natural Earth admin-1; confirm and record the licence in a comment), projects it with d3-geo (dev dependency) and writes src/data/nigeria-map.json containing { state, path, centroid } for each of the 36 states plus FCT. The site itself ships no d3.
   - NigerianMap component: SVG of all states in a muted tint on a deep-blue/indigo band; states with at least one published project filled with the accent colour; pulsing dots at office locations from WorkspaceSettings (animation off under reduced motion); legend (Head office, Project locations); a stats row above fed from WorkspaceSettings.stats.
   - Interaction: each state is a focusable element with an aria-label ("Kano: 3 projects"); hover/focus shows a tooltip, click/Enter opens a panel listing that state's projects linked to /projects/[slug]. On narrow screens the project list appears below the map instead of a tooltip. Keep the interactive part a small client component receiving DTOs as props; the SVG paths render on the server.
   - Data comes from published projects through the service (grouped by state), cached with the projects tag so publishing a project updates the map.
3. Add both sections to the home page. Seeded placeholder data is fine; do not invent real clients or states.

Verify with tsc, lint, build, a keyboard-only pass through the map, and a mobile-width check. Commit.
```

---

## Prompt 9: WordPress content import and redirects

```
Read CLAUDE.md (Routes, Content rules).

I will place the WordPress export (WXR .xml) and the downloaded media in imports/ (git-ignored).
1. Write scripts/import-wordpress.ts (tsx) that parses the export and creates DRAFT rows for news posts, team members, services and projects it can identify, mapping fields to our schema. It must be idempotent (upsert by slug), log what it skipped, and never publish anything.
2. Upload media to Cloudinary through a script using the server credentials, storing URL and public ID on each row. Drop any asset or link that points to the old theme provider and list those in docs/TODO-content.md.
3. Add the permanent redirects listed in CLAUDE.md to next.config.ts, after checking them against the export's actual permalinks (the News page lives at /wp/lavarai/).
4. Produce a short report of imported and skipped items.

Verify with tsc and lint. Do not run the import against production. Commit.
```
