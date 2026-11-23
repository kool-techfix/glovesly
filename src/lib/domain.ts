/*
 * Plain domain constants with no dependencies, so client components (the
 * admin) can import them. Server code reaches them through
 * src/Schemas/common.schema.ts, which re-exports them with Zod schemas.
 */

export const CONTENT_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Allowed status transitions. New records always start as DRAFT. */
export const STATUS_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  DRAFT: ["REVIEW", "PUBLISHED"],
  REVIEW: ["PUBLISHED", "DRAFT"],
  PUBLISHED: ["ARCHIVED", "DRAFT"],
  ARCHIVED: ["DRAFT"],
};

export const USER_ROLES = ["ADMIN", "EDITOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "DISABLED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PASSWORD_TOKEN_PURPOSES = ["RESET", "INVITE"] as const;
export type PasswordTokenPurpose = (typeof PASSWORD_TOKEN_PURPOSES)[number];

export const PROJECT_SECTORS = ["AVIATION", "CONSTRUCTION", "SECURITY", "ENERGY"] as const;
export type ProjectSector = (typeof PROJECT_SECTORS)[number];
export const PROJECT_SECTOR_LABELS: Record<ProjectSector, string> = {
  AVIATION: "Aviation infrastructure",
  CONSTRUCTION: "Construction",
  SECURITY: "Security solutions",
  ENERGY: "Energy solutions",
};

export const PROJECT_STATUSES = ["ONGOING", "COMPLETED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

// PROVISIONAL: awaiting the owner's final partner groups.
export const PARTNER_TYPES = ["GOVERNMENT", "PRIVATE_CLIENT", "TECHNOLOGY_PARTNER", "INTERNATIONAL_PARTNER"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];
export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  GOVERNMENT: "Government",
  PRIVATE_CLIENT: "Private client",
  TECHNOLOGY_PARTNER: "Technology partner",
  INTERNATIONAL_PARTNER: "International partner",
};

export const MESSAGE_STATUSES = ["NEW", "READ", "ARCHIVED"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const APPLICATION_STATUSES = ["NEW", "REVIEWED", "SHORTLISTED", "ARCHIVED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  NEW: "New",
  REVIEWED: "Reviewed",
  SHORTLISTED: "Shortlisted",
  ARCHIVED: "Archived",
};

/** Upload folders and resource types accepted by POST /api/admin/media/sign-upload. */
export const UPLOAD_FOLDERS = ["services", "projects", "news", "team", "partners", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
export const UPLOAD_RESOURCE_TYPES = ["image", "video", "raw"] as const;
export type UploadResourceType = (typeof UPLOAD_RESOURCE_TYPES)[number];
