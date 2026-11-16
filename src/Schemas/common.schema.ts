import { z } from "zod";

import { isCloudinaryUrl } from "@/lib/cloudinary";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "@/lib/slug";

/*
 * Domain enums mirroring the Prisma enums (checked at compile time in
 * src/Repositories/repository-utils.ts), so Services never import Prisma.
 */

export const CONTENT_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export const contentStatusSchema = z.enum(CONTENT_STATUSES);

export const USER_ROLES = ["ADMIN", "EDITOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const userRoleSchema = z.enum(USER_ROLES);

export const USER_STATUSES = ["ACTIVE", "DISABLED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
export const userStatusSchema = z.enum(USER_STATUSES);

export const PASSWORD_TOKEN_PURPOSES = ["RESET", "INVITE"] as const;
export type PasswordTokenPurpose = (typeof PASSWORD_TOKEN_PURPOSES)[number];

export const PROJECT_SECTORS = ["AVIATION", "CONSTRUCTION", "SECURITY", "ENERGY"] as const;
export type ProjectSector = (typeof PROJECT_SECTORS)[number];
export const projectSectorSchema = z.enum(PROJECT_SECTORS);

export const PROJECT_STATUSES = ["ONGOING", "COMPLETED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const projectStatusSchema = z.enum(PROJECT_STATUSES);

// PROVISIONAL: awaiting the owner's final partner groups.
export const PARTNER_TYPES = ["GOVERNMENT", "PRIVATE_CLIENT", "TECHNOLOGY_PARTNER"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];
export const partnerTypeSchema = z.enum(PARTNER_TYPES);

export const MESSAGE_STATUSES = ["NEW", "READ", "ARCHIVED"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export const messageStatusSchema = z.enum(MESSAGE_STATUSES);

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

/** Required, trimmed text with a length cap. */
export function text(max: number, label: string, min = 1) {
  return z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);
}

/** Optional trimmed text; empty strings become null (clears the column). */
export function optionalText(max: number, label: string) {
  return z
    .string({ invalid_type_error: `${label} must be text` })
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .nullish()
    .transform((value) => (value ? value : null));
}

/** Long-form text (summary/body). Defaults to "" so drafts can be saved incomplete. */
export function longText(max: number, label: string) {
  return z
    .string({ invalid_type_error: `${label} must be text` })
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .default("");
}

/** List of short strings (tags, capabilities); trims and drops blanks/duplicates. */
export function stringList(maxItems: number, maxLength: number, label: string) {
  return z
    .array(z.string().trim().max(maxLength, `Each ${label} must be at most ${maxLength} characters`))
    .max(maxItems, `At most ${maxItems} ${label}s`)
    .default([])
    .transform((items) => [...new Set(items.filter(Boolean))]);
}

/** Optional external https URL (LinkedIn, partner site). Empty → null. */
export const optionalUrl = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || /^https?:\/\/\S+$/i.test(value), {
    message: "Must be a full URL starting with http:// or https://",
  });

/** Optional Cloudinary asset URL on this account's cloud. Empty → null. */
export const cloudinaryUrl = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || isCloudinaryUrl(value), {
    message: "Must be an image uploaded to this site's Cloudinary account",
  });

/** Optional Cloudinary public_id paired with a cloudinaryUrl field. Empty → null. */
export const optionalPublicId = z
  .string()
  .trim()
  .max(255)
  .nullish()
  .transform((value) => (value ? value : null));

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(SLUG_MAX_LENGTH, `Slug must be at most ${SLUG_MAX_LENGTH} characters`)
  .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens");

/**
 * Fields every content create schema starts with. Status is not here: new
 * records always start as DRAFT and change only through /status.
 */
export const contentBaseShape = {
  slug: slugSchema.optional(),
  sortOrder: z.coerce.number().int().min(0).max(100_000).default(0),
};

export const idSchema = z.string().trim().min(1).max(64);
export const idParamsSchema = z.object({ id: idSchema });
export const slugParamsSchema = z.object({ slug: z.string().trim().min(1).max(200) });

export const statusChangeSchema = z.object({ status: contentStatusSchema });

export const listQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: contentStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListQuery = z.infer<typeof listQuerySchema>;
