/*
 * Development seed: `pnpm db:seed` (prisma db seed → tsx prisma/seed.ts).
 *
 * Idempotent. Every row is created only if missing (upsert with an empty
 * update), so re-running never overwrites edits made in the admin.
 *
 * - Two dev accounts (ADMIN and EDITOR). Override with the SEED_* variables;
 *   the fake defaults are refused when NODE_ENV=production.
 * - The four real services (owner copy, prisma/seed-services.ts), the five
 *   international partners (logos from prisma/data/partner-logos.json, written
 *   by `pnpm partners:upload`) and the six real projects
 *   (prisma/seed-projects.ts), in every environment.
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
import { SEED_PROJECTS } from "./seed-projects";
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

async function seedNews(authorId: string | null) {
  const rows = [
    { slug: "sample-news-post-one", title: "Sample News Post One", status: "PUBLISHED" as const, daysAgo: 3 },
    { slug: "sample-news-post-two", title: "Sample News Post Two", status: "PUBLISHED" as const, daysAgo: 10 },
    { slug: "sample-news-post-three", title: "Sample News Post Three", status: "REVIEW" as const, daysAgo: 0 },
    { slug: "sample-news-post-four", title: "Sample News Post Four", status: "DRAFT" as const, daysAgo: 0 },
  ];
  for (const [index, row] of rows.entries()) {
    await prisma.newsPost.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        slug: row.slug,
        title: row.title,
        sortOrder: index,
        status: row.status,
        publishedAt:
          row.status === "PUBLISHED" ? new Date(now.getTime() - row.daysAgo * 24 * 60 * 60 * 1000) : null,
        excerpt: "Placeholder excerpt. Replace with a real news item.",
        body: "Placeholder article body. Replace before launch.",
        tags: ["sample"],
        authorId,
      },
    });
  }
  console.info(`  news: ${rows.length} placeholders`);
}

async function seedTeam() {
  const rows = [
    { slug: "sample-person-one", name: "Sample Person One", role: "Sample role", status: "PUBLISHED" as const },
    { slug: "sample-person-two", name: "Sample Person Two", role: "Sample role", status: "PUBLISHED" as const },
    { slug: "sample-person-three", name: "Sample Person Three", role: "Sample role", status: "PUBLISHED" as const },
    { slug: "sample-person-four", name: "Sample Person Four", role: "Sample role", status: "DRAFT" as const },
  ];
  for (const [index, row] of rows.entries()) {
    await prisma.teamMember.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        slug: row.slug,
        name: row.name,
        role: row.role,
        sortOrder: index,
        ...publishedFields(row.status),
        bio: "Placeholder biography. Replace with the team member's approved bio.",
      },
    });
  }
  console.info(`  team: ${rows.length} placeholders`);
}

const PARTNER_LOGOS_FILE = join(import.meta.dirname, "data", "partner-logos.json");

/** Real international partners (owner-supplied). Logos come from `pnpm partners:upload`. */
const SEED_PARTNERS = [
  { sortOrder: 10, slug: "alpine-metal-tech", name: "Alpine Metal Tech UK Ltd" },
  { sortOrder: 20, slug: "ams-aircraft-recovery", name: "AMS Aircraft Recovery Limited" },
  { sortOrder: 30, slug: "dat-con", name: "DAT-CON" },
  { sortOrder: 40, slug: "structurus", name: "STRUCTURUS" },
  { sortOrder: 50, slug: "adb-safegate", name: "ADB SAFEGATE" },
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
    const existing = await prisma.partner.findUnique({ where: { slug: partner.slug }, select: { id: true } });
    const logo = logos[partner.slug]!;
    await prisma.partner.upsert({
      where: { slug: partner.slug },
      update: {},
      create: {
        slug: partner.slug,
        name: partner.name,
        type: "INTERNATIONAL_PARTNER",
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
    if (!existing) created += 1;
  }
  console.info(`  partners: ${created} created, ${SEED_PARTNERS.length - created} already present (left unchanged)`);
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
      stats: [
        { label: "Sample stat one", value: "00" },
        { label: "Sample stat two", value: "00" },
        { label: "Sample stat three", value: "00" },
      ],
    },
  });
  console.info("  workspace settings: contact details, placeholder stats");
}

// ---------------------------------------------------------------------------

async function main() {
  console.info("Seeding users…");
  await seedUsers();

  console.info("Seeding services, partners and projects (owner content)…");
  await seedServices();
  await seedPartners();
  await seedProjects();

  if (isProduction) {
    console.info("NODE_ENV=production: skipping placeholder content.");
  } else {
    console.info("Seeding placeholder content…");
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
    await seedNews(admin?.id ?? null);
    await seedTeam();
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
