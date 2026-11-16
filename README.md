# Glovesly Pro-Project website

Next.js 16 rebuild of gloveslyproject.com with a CMS admin. Architecture, layering and conventions follow ICAADA: see `CLAUDE.md` and `docs/reference/ARCHITECTURE.md`.

## Setup

```bash
pnpm install                     # also runs prisma generate
cp .env.example .env             # fill in every required variable
pnpm db:migrate --name init      # first migration (needs DIRECT_URL)
pnpm dev
```

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

**API routes**

| Route | Guard |
|---|---|
| `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | login rate-limited; me: signed in |
| `POST /api/auth/password/{forgot,check,reset}` | none; rate-limited |
| `GET/POST /api/admin/users` · `GET/PATCH/DELETE /api/admin/users/[id]` | ADMIN |
| `DELETE /api/admin/users/[id]/sessions` (sign out everywhere) · `POST /api/admin/users/[id]/password-link` | ADMIN |
| `GET /api/admin/activity` | EDITOR+ |

**Not built yet:** the content modules (Service, Project, NewsPost, TeamMember, Partner), contact form and inbox, workspace settings, media upload signing route, seed script, public pages and the admin UI.
