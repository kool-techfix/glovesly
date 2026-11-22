/*
 * Development seed: `pnpm db:seed` (prisma db seed → tsx prisma/seed.ts).
 *
 * Idempotent. Every row is created only if missing (upsert with an empty
 * update), so re-running never overwrites edits made in the admin.
 *
 * - Two dev accounts (ADMIN and EDITOR). Override with the SEED_* variables;
 *   the fake defaults are refused when NODE_ENV=production.
 * - The four real services (owner copy, prisma/seed-services.ts), the five
 *   international partners and two government clients (logos from
 *   prisma/data/partner-logos.json, written by `pnpm partners:upload`), the
 *   six real projects (prisma/seed-projects.ts), three news articles
 *   (prisma/data/news-seed.ts) and the twelve team members
 *   (prisma/seed-team.ts), in every environment.
 * - Clearly fake placeholder content for the other modules and the workspace
 *   settings, so pages and admin screens have something to show. Nothing there
 *   is a company fact; see docs/TODO-content.md. Skipped in production.
 *
 * This is one of the two files outside src/Repositories allowed to use Prisma.
 */
import "dotenv/config";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

import { PrismaClient } from "../src/generated/prisma/client";
import { isNigeriaState } from "../src/lib/nigeria-states";
import { SEED_NEWS } from "./data/news-seed";
import { SEED_PROJECTS } from "./seed-projects";
import { SEED_TEAM } from "./seed-team";
import { RETIRED_SAMPLE_SERVICE_SLUGS, SEED_SERVICES } from "./seed-services";

const BCRYPT_ROUNDS = 12;
const isProduction = process.env.NODE_ENV === "production";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
    ...(process.env.DATABASE_POOL_MAX ? { max: Number(process.env.DATABASE_POOL_MAX) } : {}),
  }),
});

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

const DEV_ACCOUNTS = [
  {
    role: "ADMIN" as const,
    name: "Dev Admin",
    emailVar: "SEED_ADMIN_EMAIL",
    passwordVar: "SEED_ADMIN_PASSWORD",
    defaultEmail: "admin@example.org",
    defaultPassword: "dev-admin-password-123",
  },
  {
    role: "EDITOR" as const,
    name: "Dev Editor",
    emailVar: "SEED_EDITOR_EMAIL",
    passwordVar: "SEED_EDITOR_PASSWORD",
    defaultEmail: "editor@example.org",
    defaultPassword: "dev-editor-password-123",
  },
];

async function seedUsers() {
  for (const account of DEV_ACCOUNTS) {
    const email = (process.env[account.emailVar] || account.defaultEmail).trim().toLowerCase();
    const password = process.env[account.passwordVar] || account.defaultPassword;

    if (isProduction && (email === account.defaultEmail || password === account.defaultPassword)) {
      throw new Error(
        `Refusing to seed the default ${account.role} account in production. ` +
          `Set ${account.emailVar} and ${account.passwordVar}.`,
      );
    }
    if (password.length < 12) {
      throw new Error(`${account.passwordVar} must be at least 12 characters.`);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.info(`  user ${email} already exists (left unchanged)`);
      continue;
    }
    await prisma.user.create({
      data: {
        email,
        name: account.name,
        role: account.role,
        status: "ACTIVE",
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      },
    });
    console.info(`  user ${email} (${account.role}) created`);
  }
}

// ---------------------------------------------------------------------------
// Placeholder content (development only)
// ---------------------------------------------------------------------------

/*
 * Published placeholders have no images: no real Cloudinary assets exist yet,
 * so they intentionally bypass the publish rules the API enforces. Public
 * components must cope with null media anyway. One DRAFT and one REVIEW row
 * per module exercise the admin status filters and the review queue.
 */

const now = new Date();

function publishedFields(status: "DRAFT" | "REVIEW" | "PUBLISHED") {
  return { status, publishedAt: status === "PUBLISHED" ? now : null };
}

/**
 * The four real service lines (owner copy, prisma/seed-services.ts). Seeded in
 * every environment. PUBLISHED without images: the seed writes through Prisma,
 * so the API's publish rule (image required) does not apply; public pages show
 * a solid accent block until a photo is uploaded.
 */
async function seedServices() {
  const removed = await prisma.service.deleteMany({ where: { slug: { in: RETIRED_SAMPLE_SERVICE_SLUGS } } });
  if (removed.count) console.info(`  services: removed ${removed.count} old placeholder rows`);

  let created = 0;
  for (const service of SEED_SERVICES) {
    const existing = await prisma.service.findUnique({ where: { slug: service.slug }, select: { id: true } });
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        slug: service.slug,
        title: service.title,
        sector: service.sector,
        sortOrder: service.sortOrder,
        ...publishedFields("PUBLISHED"),
        summary: service.summary,
        body: service.paragraphs.join("\n\n"),
        capabilities: service.capabilities,
        imageUrl: null,
        imagePublicId: null,
      },
    });
    if (!existing) created += 1;
  }
  console.info(`  services: ${created} created, ${SEED_SERVICES.length - created} already present (left unchanged)`);
}

/**
 * The six real projects (prisma/seed-projects.ts). Created only if the slug is
 * missing; an existing row is never touched, because the owner edits these in
 * the admin (images, descriptions, years). Placeholder rows are removed, but
 * only those whose slug starts with "sample-".
 */
async function seedProjects() {
  const removed = await prisma.project.deleteMany({ where: { slug: { startsWith: "sample-" } } });
  if (removed.count) console.info(`  projects: removed ${removed.count} placeholder rows (slug sample-*)`);

  let created = 0;
  for (const project of SEED_PROJECTS) {
    if (!isNigeriaState(project.state)) throw new Error(`${project.slug}: "${project.state}" is not in NIGERIA_STATES`);
    const existing = await prisma.project.findUnique({ where: { slug: project.slug }, select: { id: true } });
    if (existing) {
      console.info(`  kept existing: ${project.slug}`);
      continue;
    }
    await prisma.project.create({
      data: {
        slug: project.slug,
        title: project.title,
        sortOrder: project.sortOrder,
        ...publishedFields("PUBLISHED"),
        sector: project.sector,
        client: project.client,
        state: project.state,
        locationLabel: project.locationLabel,
        projectStatus: "COMPLETED",
        // Not supplied yet: left empty, never filler. The admin's publish rule
        // (cover image required) is not applied here; the seed writes directly.
        summary: "",
        body: "",
        year: null,
        latitude: null,
        longitude: null,
        coverImageUrl: null,
        coverImagePublicId: null,
        galleryUrls: [],
        galleryPublicIds: [],
      },
    });
    created += 1;
    console.info(`  created: ${project.slug}`);
  }
  console.info(`  projects: ${created} created, ${SEED_PROJECTS.length - created} kept`);
}

/**
 * The three real news articles (prisma/data/news-seed.ts). Created only if the
 * slug is missing; an existing row is never touched, because the owner edits
 * these in the admin. Placeholder rows are removed, but only those whose slug
 * starts with "sample-". No author is set, so no byline is shown.
 */
async function seedNews() {
  const removed = await prisma.newsPost.deleteMany({ where: { slug: { startsWith: "sample-" } } });
  if (removed.count) console.info(`  news: removed ${removed.count} placeholder rows (slug sample-*)`);

  let created = 0;
  for (const post of SEED_NEWS) {
    const existing = await prisma.newsPost.findUnique({ where: { slug: post.slug }, select: { id: true } });
    if (existing) {
      console.info(`  kept existing: ${post.slug}`);
      continue;
    }
    await prisma.newsPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        sortOrder: post.sortOrder,
        status: post.status,
        // The report date, also on the draft, so publishing it later keeps that date.
        publishedAt: new Date(`${post.publishedOn}T12:00:00+01:00`),
        excerpt: post.excerpt,
        body: post.paragraphs.join("\n\n"),
        tags: post.tags,
        sourceName: post.sourceName,
        sourceUrl: post.sourceUrl,
        // No cover yet; the admin's cover-image publish rule does not apply to the seed.
        coverImageUrl: null,
        coverImagePublicId: null,
        authorId: null,
      },
    });
    created += 1;
    console.info(`  created: ${post.slug} (${post.status.toLowerCase()})`);
  }
  console.info(`  news: ${created} created, ${SEED_NEWS.length - created} kept`);
}

/**
 * The twelve real team members (prisma/seed-team.ts). Created only if the slug
 * is missing; an existing row is never touched, because the owner edits these
 * in the admin. Placeholder rows are removed, but only those whose slug starts
 * with "sample-". No photos: the admin's photo publish rule does not apply here.
 */
async function seedTeam() {
  const removed = await prisma.teamMember.deleteMany({ where: { slug: { startsWith: "sample-" } } });
  if (removed.count) console.info(`  team: removed ${removed.count} placeholder rows (slug sample-*)`);

  let created = 0;
  for (const member of SEED_TEAM) {
    const existing = await prisma.teamMember.findUnique({ where: { slug: member.slug }, select: { id: true } });
    if (existing) {
      console.info(`  kept existing: ${member.slug}`);
      continue;
    }
    await prisma.teamMember.create({
      data: {
        slug: member.slug,
        name: member.name,
        role: member.role,
        sortOrder: member.sortOrder,
        ...publishedFields("PUBLISHED"),
        featured: member.featured,
        bio: member.bio,
        photoUrl: null,
        photoPublicId: null,
        linkedinUrl: null,
      },
    });
    created += 1;
    console.info(`  created: ${member.slug}`);
  }
  console.info(`  team: ${created} created, ${SEED_TEAM.length - created} kept`);
}

const PARTNER_LOGOS_FILE = join(import.meta.dirname, "data", "partner-logos.json");

/** Real partners and clients (owner-supplied). Logos come from `pnpm partners:upload`. */
const SEED_PARTNERS: Array<{
  sortOrder: number;
  slug: string;
  name: string;
  type: "GOVERNMENT" | "INTERNATIONAL_PARTNER";
}> = [
  { sortOrder: 10, slug: "alpine-metal-tech", name: "Alpine Metal Tech UK Ltd", type: "INTERNATIONAL_PARTNER" },
  { sortOrder: 20, slug: "ams-aircraft-recovery", name: "AMS Aircraft Recovery Limited", type: "INTERNATIONAL_PARTNER" },
  { sortOrder: 30, slug: "dat-con", name: "DAT-CON", type: "INTERNATIONAL_PARTNER" },
  { sortOrder: 40, slug: "structurus", name: "STRUCTURUS", type: "INTERNATIONAL_PARTNER" },
  { sortOrder: 50, slug: "adb-safegate", name: "ADB SAFEGATE", type: "INTERNATIONAL_PARTNER" },
  { sortOrder: 60, slug: "faan", name: "Federal Airports Authority of Nigeria", type: "GOVERNMENT" },
  { sortOrder: 70, slug: "ncat", name: "Nigerian College of Aviation Technology, Zaria", type: "GOVERNMENT" },
];

const RETIRED_SAMPLE_PARTNER_SLUGS = [
  "sample-partner-one",
  "sample-partner-two",
  "sample-partner-three",
  "sample-partner-four",
  "sample-partner-five",
];

type PartnerLogoEntry = {
  logoUrl: string;
  logoPublicId: string;
  logoOnDarkUrl: string | null;
  logoOnDarkPublicId: string | null;
  logoWidth: number;
  logoHeight: number;
};

function readPartnerLogos(): Record<string, PartnerLogoEntry> {
  if (!existsSync(PARTNER_LOGOS_FILE)) {
    throw new Error(`${PARTNER_LOGOS_FILE} is missing. Run pnpm partners:upload first.`);
  }
  const logos = JSON.parse(readFileSync(PARTNER_LOGOS_FILE, "utf8")) as Record<string, PartnerLogoEntry>;
  const absent = SEED_PARTNERS.filter((partner) => !logos[partner.slug]?.logoUrl).map((partner) => partner.slug);
  if (absent.length) {
    throw new Error(`prisma/data/partner-logos.json has no logo for: ${absent.join(", ")}. Run pnpm partners:upload first.`);
  }
  return logos;
}

/**
 * Seeded in every environment. websiteUrl stays null: no URLs were supplied
 * (docs/TODO-content.md). Removes the old "Sample Partner" rows so the
 * carousel shows only real partners.
 */
async function seedPartners() {
  const logos = readPartnerLogos();

  const removed = await prisma.partner.deleteMany({ where: { slug: { in: RETIRED_SAMPLE_PARTNER_SLUGS } } });
  if (removed.count) console.info(`  partners: removed ${removed.count} old placeholder rows`);

  let created = 0;
  for (const partner of SEED_PARTNERS) {
    // Never overwrite an existing row: the owner edits partners in the admin.
    const existing = await prisma.partner.findUnique({ where: { slug: partner.slug }, select: { id: true } });
    if (existing) {
      console.info(`  kept existing: ${partner.slug}`);
      continue;
    }
    const logo = logos[partner.slug]!;
    await prisma.partner.create({
      data: {
        slug: partner.slug,
        name: partner.name,
        type: partner.type,
        sortOrder: partner.sortOrder,
        ...publishedFields("PUBLISHED"),
        logoUrl: logo.logoUrl,
        logoPublicId: logo.logoPublicId,
        logoOnDarkUrl: logo.logoOnDarkUrl,
        logoOnDarkPublicId: logo.logoOnDarkPublicId,
        logoWidth: logo.logoWidth,
        logoHeight: logo.logoHeight,
        websiteUrl: null,
      },
    });
    created += 1;
    console.info(`  created: ${partner.slug} (${partner.type.toLowerCase()})`);
  }
  console.info(`  partners: ${created} created, ${SEED_PARTNERS.length - created} kept`);
}

async function seedWorkspace() {
  await prisma.workspaceSettings.upsert({
    where: { id: "workspace" },
    update: {},
    create: {
      id: "workspace",
      // Real contact details supplied by the owner. Contact-form alerts go to this
      // address whenever SMTP is configured, including in development.
      contactEmail: "info@gloveslyproject.com",
      phone: "+234 704 780 0065",
      address: "37 Yakubu Gowon Crescent,\nAbuja, Federal Capital Territory, Nigeria",
      // Not yet confirmed as the head office; no coordinates supplied (the map uses the FCT centroid).
      officeLocations: [{ name: "Abuja office", state: "Federal Capital Territory", latitude: null, longitude: null, isHeadOffice: false }],
      // No figures supplied yet; the map band shows no stats until the owner adds them.
      stats: [],
    },
  });
  console.info("  workspace settings: contact details");
}

// ---------------------------------------------------------------------------

async function main() {
  console.info("Seeding users…");
  await seedUsers();

  console.info("Seeding services, partners, projects, news and team (owner content)…");
  await seedServices();
  await seedPartners();
  await seedProjects();
  await seedNews();
  await seedTeam();

  if (isProduction) {
    console.info("NODE_ENV=production: skipping placeholder content.");
  } else {
    console.info("Seeding placeholder content…");
    await seedWorkspace();
  }

  console.info("Done.");
  console.info(
    "\nNote: the seed writes straight to the database and does not clear Next.js caches.\n" +
      "To see the changes now: stop the dev server, delete .next (rm -rf .next) and start it again.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
