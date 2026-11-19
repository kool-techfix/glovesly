# Glovesly Pro-Project website

Next.js 16 rebuild of gloveslyproject.com with a CMS admin. Architecture, layering and conventions follow ICAADA: see `CLAUDE.md` and `docs/reference/ARCHITECTURE.md`.

## Setup

```bash
pnpm install                     # also runs prisma generate
cp .env.example .env             # fill in every required variable
pnpm db:migrate                  # apply migrations (needs DIRECT_URL)
pnpm db:seed                     # dev users + placeholder content (idempotent)
pnpm dev
```

Seed accounts: `admin@example.org` / `dev-admin-password-123` (ADMIN) and `editor@example.org` / `dev-editor-password-123` (EDITOR), unless the `SEED_*` variables are set. Placeholder content is listed in `docs/TODO-content.md`.

Scripts: `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm db:generate` · `pnpm db:migrate` · `pnpm db:deploy` · `pnpm db:seed` · `pnpm db:studio`.

## What exists so far

Layering is strict: Route Handler → Guard → Service → Repository → Prisma. Only `src/Repositories/` and `src/lib/prisma.ts` import Prisma.

**Shared infrastructure**

| Area | Files |
|---|---|
| Env | `src/lib/env.ts` (Zod `getEnv()`), validated at boot by `src/instrumentation.ts` |
| Database | `prisma/schema.prisma`, `prisma.config.ts`, `src/lib/prisma.ts` (`getPrisma()`, adapter-pg) |
| API helpers | `src/lib/api/`: `api-error` · `response` (`ok`/`handle`, `{ data, meta }` / `{ error }`) · `request` (Zod parsing, client IP) · `content-routes` (route factories for content modules) |
| Auth | `src/lib/auth/`: `session` (HS256 JWT, `jti` = Session id) · `cookies` (`glovesly_session`) · `password` (bcrypt) · `tokens` (SHA-256 hashed reset/invite links) · `auth-guard` (`requireAuth`/`requireEditor`/`requireAdmin`, DB re-check every request) |
| Caching | `src/lib/cache.ts`: `unstable_cache` wrappers, `revalidateContent()` |
| Other | `rate-limit.ts` (in-memory), `cloudinary.ts` (upload signing, URL allow-list), `slug.ts`, `email/` (Nodemailer SMTP + branded templates), `nigeria-states.ts` |
| Repositories | `repository-utils.ts` (`ContentRepository`, `withPrismaErrors`, enum mirror checks), user, session, password-token, activity-log |
| Schemas | `common.schema.ts` (domain enums, `contentBaseShape`, field helpers), auth, user, activity |
| Services | `content.service.ts` (`createContentService()`: listing, slugs, status transitions, publish rules, activity log, revalidation), auth, password, user, activity, notification |

**Content modules** (schema · repository · service · routes, ARCHITECTURE.md §11)

| Module | Publish rule (on top of the shared transitions) | Public detail route |
|---|---|---|
| `team` (TeamMember) | photo | none |
| `news` (NewsPost) | cover image; author defaults to the creator | `/api/public/news/[slug]` |
| `services` (Service) | image and at least one capability | `/api/public/services/[slug]` |
| `projects` (Project) | cover image, sector, valid state; latitude and longitude set together | `/api/public/projects/[slug]` |
| `partners` (Partner) | logo | none |

Media URLs must be on `res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/`.

**Other aggregates:** contact inbox (`contact.*`, honeypot field `website_url`), workspace settings (`settings.*`), admin summary (`summary.service.ts`), Cloudinary signing (`media.schema.ts`).

**API routes**

| Route | Guard |
|---|---|
| `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | login rate-limited; me: signed in |
| `POST /api/auth/password/{forgot,check,reset}` | none; rate-limited |
| `GET/POST /api/admin/users` · `GET/PATCH/DELETE /api/admin/users/[id]` | ADMIN |
| `DELETE /api/admin/users/[id]/sessions` (sign out everywhere) · `POST /api/admin/users/[id]/password-link` | ADMIN |
| `GET /api/admin/activity` | EDITOR+ |
| `GET/POST /api/admin/{team,news,services,projects,partners}` · `GET/PATCH/DELETE …/[id]` · `POST …/[id]/status` | EDITOR+ |
| `GET /api/public/{team,news,services,projects,partners}` · `GET /api/public/{news,services,projects}/[slug]` | none (PUBLISHED only) |
| `POST /api/public/contact` | none; per-IP rate limit; 202 |
| `GET /api/admin/messages` · `GET/PATCH/DELETE /api/admin/messages/[id]` | EDITOR+ |
| `GET /api/admin/settings` · `PATCH /api/admin/settings` | GET: EDITOR+ · PATCH: ADMIN |
| `POST /api/admin/media/sign-upload` · `GET /api/admin/summary` | EDITOR+ |

**Not built yet:** profile endpoints (`/api/admin/profile`), public pages and the admin UI.
