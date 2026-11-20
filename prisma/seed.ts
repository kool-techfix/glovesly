/*
 * Development seed: `pnpm db:seed` (prisma db seed → tsx prisma/seed.ts).
 *
 * Idempotent. Every row is created only if missing (upsert with an empty
 * update), so re-running never overwrites edits made in the admin.
 *
 * - Two dev accounts (ADMIN and EDITOR). Override with the SEED_* variables;
 *   the fake defaults are refused when NODE_ENV=production.
 * - The four real services (owner copy, prisma/seed-services.ts), in every
 *   environment.
 * - Clearly fake placeholder content for the other modules and the workspace
 *   settings, so pages and admin screens have something to show. Nothing there
 *   is a company fact; see docs/TODO-content.md. Skipped in production.
 *
 * This is one of the two files outside src/Repositories allowed to use Prisma.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

import { PrismaClient } from "../src/generated/prisma/client";
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

async function seedProjects() {
  // States are required by the schema; these are arbitrary placeholders, not
  // places the company has worked. Replace with real projects from the owner.
  const rows = [
    { slug: "sample-project-one", title: "Sample Project One", sector: "AVIATION" as const, state: "Federal Capital Territory", status: "PUBLISHED" as const },
    { slug: "sample-project-two", title: "Sample Project Two", sector: "CONSTRUCTION" as const, state: "Lagos", status: "PUBLISHED" as const },
    { slug: "sample-project-three", title: "Sample Project Three", sector: "SECURITY" as const, state: "Kano", status: "PUBLISHED" as const },
    { slug: "sample-project-four", title: "Sample Project Four", sector: "ENERGY" as const, state: "Rivers", status: "REVIEW" as const },
    { slug: "sample-project-five", title: "Sample Project Five", sector: "CONSTRUCTION" as const, state: "Enugu", status: "DRAFT" as const },
  ];
  for (const [index, row] of rows.entries()) {
    await prisma.project.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        slug: row.slug,
        title: row.title,
        sortOrder: index,
        ...publishedFields(row.status),
        sector: row.sector,
        state: row.state,
        client: "Sample Client",
        locationLabel: "Sample location",
        summary: "Placeholder summary. Replace with real project details from the owner.",
        body: "Placeholder body text. Replace before launch.",
        projectStatus: index % 2 === 0 ? "COMPLETED" : "ONGOING",
      },
    });
  }
  console.info(`  projects: ${rows.length} placeholders`);
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

async function seedPartners() {
  const rows = [
    { slug: "sample-partner-one", name: "Sample Partner One", type: "GOVERNMENT" as const, status: "PUBLISHED" as const },
    { slug: "sample-partner-two", name: "Sample Partner Two", type: "PRIVATE_CLIENT" as const, status: "PUBLISHED" as const },
    { slug: "sample-partner-three", name: "Sample Partner Three", type: "PRIVATE_CLIENT" as const, status: "PUBLISHED" as const },
    { slug: "sample-partner-four", name: "Sample Partner Four", type: "TECHNOLOGY_PARTNER" as const, status: "PUBLISHED" as const },
    { slug: "sample-partner-five", name: "Sample Partner Five", type: "GOVERNMENT" as const, status: "DRAFT" as const },
  ];
  for (const [index, row] of rows.entries()) {
    await prisma.partner.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        slug: row.slug,
        name: row.name,
        type: row.type,
        sortOrder: index,
        ...publishedFields(row.status),
      },
    });
  }
  console.info(`  partners: ${rows.length} placeholders`);
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

  console.info("Seeding services (owner copy)…");
  await seedServices();

  if (isProduction) {
    console.info("NODE_ENV=production: skipping placeholder content.");
    return;
  }

  console.info("Seeding placeholder content…");
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  await seedProjects();
  await seedNews(admin?.id ?? null);
  await seedTeam();
  await seedPartners();
  await seedWorkspace();
  console.info("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
