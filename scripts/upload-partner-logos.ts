/**
 * Uploads the partner logos in imports/partner-logos/ to Cloudinary and writes
 * prisma/data/partner-logos.json, which prisma/seed.ts reads.
 *
 * Run: pnpm partners:upload
 *
 * - Signed uploads through signServerUpload (src/lib/cloudinary.ts); no SDK.
 * - Folder glovesly/partners, fixed public IDs (<slug> and <slug>-on-dark),
 *   overwrite + invalidate, so re-running replaces the assets, never duplicates.
 * - The JSON holds only public delivery URLs, public IDs and pixel sizes. No secrets.
 *
 * Logo convention: logoUrl works on LIGHT backgrounds (dark lettering);
 * logoOnDarkUrl is the white/light version for DARK backgrounds.
 * The artwork is third-party: it is uploaded unchanged.
 */
import "dotenv/config";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { signServerUpload } from "../src/lib/cloudinary";
import { getEnv } from "../src/lib/env";

const ROOT = join(import.meta.dirname, "..");
const SOURCE_DIR = join(ROOT, "imports", "partner-logos");
const OUTPUT = join(ROOT, "prisma", "data", "partner-logos.json");

/** slug → light-background file, optional dark-background file. */
const LOGOS: { slug: string; light: string; dark: string | null }[] = [
  { slug: "alpine-metal-tech", light: "alpine-metal-tech.png", dark: null },
  { slug: "ams-aircraft-recovery", light: "ams-aircraft-recovery.png", dark: null },
  { slug: "dat-con", light: "dat-con.png", dark: null },
  // SVGs preferred; the structurus-*.png files are only a fallback if an SVG upload fails.
  { slug: "structurus", light: "structurus-dark.svg", dark: "structurus-white.svg" },
  { slug: "adb-safegate", light: "adb-safegate-dark.png", dark: "adb-safegate-white.png" },
  // Government clients. NCAT: the seal only; the longer lockup is not used.
  { slug: "faan", light: "faan.png", dark: null },
  { slug: "ncat", light: "ncat-seal.png", dark: null },
];

const SVG_FALLBACKS: Record<string, string> = {
  "structurus-dark.svg": "structurus-dark.png",
  "structurus-white.svg": "structurus-white.png",
};

export type PartnerLogoEntry = {
  logoUrl: string;
  logoPublicId: string;
  logoOnDarkUrl: string | null;
  logoOnDarkPublicId: string | null;
  logoWidth: number;
  logoHeight: number;
};

type UploadResult = { secure_url: string; public_id: string; width: number; height: number };

const MIME: Record<string, string> = { ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".webp": "image/webp" };

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function upload(file: string, publicId: string): Promise<UploadResult> {
  const path = join(SOURCE_DIR, file);
  const { uploadUrl, fields } = signServerUpload({ folder: "partners", publicId, resourceType: "image" });
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  form.append("file", new Blob([readFileSync(path)], { type: MIME[extname(file).toLowerCase()] ?? "application/octet-stream" }), file);

  // The network to Cloudinary can be flaky; retry a couple of times.
  let lastError = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(uploadUrl, { method: "POST", body: form });
      const body = (await response.json()) as Partial<UploadResult> & { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? `HTTP ${response.status}`);
      if (!body.secure_url || !body.public_id || !body.width || !body.height) {
        throw new Error("Cloudinary's response is missing secure_url, public_id, width or height");
      }
      return body as UploadResult;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (/invalid signature|api key|unknown|not allowed|invalid image/i.test(lastError)) break;
    }
  }
  throw new Error(`${file}: ${lastError}`);
}

async function uploadPreferSvg(file: string, publicId: string): Promise<UploadResult> {
  try {
    return await upload(file, publicId);
  } catch (error) {
    const fallback = SVG_FALLBACKS[file];
    if (!fallback) throw error;
    console.warn(`  ! ${(error as Error).message}. Falling back to ${fallback}.`);
    return upload(fallback, publicId);
  }
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    fail(`Folder not found: ${relative(ROOT, SOURCE_DIR)}/\n  Put the partner logo files there (see the mapping in this script) and run again.`);
  }
  const needed = LOGOS.flatMap((logo) => [logo.light, ...(logo.dark ? [logo.dark] : [])]);
  const missing = needed.filter((file) => !existsSync(join(SOURCE_DIR, file)));
  if (missing.length) fail(`Missing in ${relative(ROOT, SOURCE_DIR)}/: ${missing.join(", ")}`);

  let cloudName: string;
  try {
    cloudName = getEnv().CLOUDINARY_CLOUD_NAME;
  } catch (error) {
    fail(
      `Environment is not valid, so nothing was uploaded.\n` +
        `  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set in .env.\n\n` +
        (error as Error).message,
    );
  }

  console.info(`Uploading ${needed.length} files to Cloudinary (${cloudName}), folder glovesly/partners…`);
  // Start from the existing file so no entry is ever dropped; uploaded slugs are replaced.
  const output: Record<string, PartnerLogoEntry> = existsSync(OUTPUT)
    ? (JSON.parse(readFileSync(OUTPUT, "utf8")) as Record<string, PartnerLogoEntry>)
    : {};
  for (const logo of LOGOS) {
    const light = await uploadPreferSvg(logo.light, logo.slug);
    console.info(`  ✓ ${logo.slug}: ${light.public_id} (${light.width}×${light.height})`);
    const dark = logo.dark ? await uploadPreferSvg(logo.dark, `${logo.slug}-on-dark`) : null;
    if (dark) console.info(`  ✓ ${logo.slug}: ${dark.public_id} (${dark.width}×${dark.height})`);
    output[logo.slug] = {
      logoUrl: light.secure_url,
      logoPublicId: light.public_id,
      logoOnDarkUrl: dark?.secure_url ?? null,
      logoOnDarkPublicId: dark?.public_id ?? null,
      logoWidth: light.width,
      logoHeight: light.height,
    };
  }

  mkdirSync(join(ROOT, "prisma", "data"), { recursive: true });
  writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.info(`Wrote ${relative(ROOT, OUTPUT)}. Next: pnpm db:seed`);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
