import { Prisma } from "@/generated/prisma/client";
import type * as PrismaEnums from "@/generated/prisma/enums";
import { ApiError } from "@/lib/api/api-error";
import type * as Domain from "@/Schemas/common.schema";

// ---------------------------------------------------------------------------
// Shared content repository contract
// ---------------------------------------------------------------------------

/** Columns every content model has. */
export type ContentRecord = {
  id: string;
  slug: string;
  status: Domain.ContentStatus;
  publishedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Columns the content service controls (never taken from request bodies). */
export type ContentSystemFields = {
  slug: string;
  status: Domain.ContentStatus;
  publishedAt: Date | null;
};

export type ContentListParams = {
  search?: string;
  status?: Domain.ContentStatus;
  page: number;
  pageSize: number;
};

export type ListResult<T> = { items: T[]; total: number };

export type StatusCounts = Record<Domain.ContentStatus, number>;

/**
 * Implemented once per content module against its Prisma delegate.
 * `TCreate`/`TUpdate` are the validated inputs minus the system fields.
 */
export interface ContentRepository<TRecord extends ContentRecord, TCreate, TUpdate> {
  list(params: ContentListParams): Promise<ListResult<TRecord>>;
  findById(id: string): Promise<TRecord | null>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  create(data: Omit<TCreate, "slug"> & ContentSystemFields): Promise<TRecord>;
  update(id: string, data: Omit<Partial<TUpdate>, "slug"> & Partial<ContentSystemFields>): Promise<TRecord>;
  delete(id: string): Promise<TRecord>;
  /** PUBLISHED rows in public order. */
  listPublished(): Promise<TRecord[]>;
  findPublishedBySlug(slug: string): Promise<TRecord | null>;
  countByStatus(): Promise<StatusCounts>;
}

/*
 * Paged lists run findMany and count with Promise.all, not $transaction: a
 * read needs no transaction, and an array transaction must wait for a
 * dedicated connection (2s limit), which can fail (P2028) on a cold pool.
 */
export function pageArgs(page: number, pageSize: number) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

/** Turns a groupBy over `status` into a full count map (missing statuses = 0). */
export function toStatusCounts(rows: Array<{ status: Domain.ContentStatus; _count: { _all: number } }>): StatusCounts {
  const counts: StatusCounts = { DRAFT: 0, REVIEW: 0, PUBLISHED: 0, ARCHIVED: 0 };
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

/** Case-insensitive `contains` filter over several string columns. */
export function searchFilter<Field extends string>(fields: Field[], search?: string) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({ [field]: { contains: search, mode: "insensitive" as const } })),
  };
}

// ---------------------------------------------------------------------------
// Prisma error mapping
// ---------------------------------------------------------------------------

function conflictFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const meta = error.meta as
    | {
        target?: string[] | string;
        driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } };
      }
    | undefined;
  const target = meta?.target ?? meta?.driverAdapterError?.cause?.constraint?.fields;
  if (Array.isArray(target)) return target;
  return typeof target === "string" ? [target] : [];
}

/**
 * Maps known Prisma errors to API errors:
 * unique (P2002) → 409, record missing (P2025) → 404, bad foreign key (P2003) → 422.
 */
export async function withPrismaErrors<T>(fn: () => Promise<T>, entity = "Record"): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": {
          const fields = conflictFields(error);
          const details = Object.fromEntries(
            fields.map((field) => [field, `This ${field} is already in use`]),
          );
          throw ApiError.conflict(
            fields.length
              ? `${entity} with this ${fields.join(", ")} already exists.`
              : `${entity} already exists.`,
            fields.length ? details : undefined,
          );
        }
        case "P2025":
          throw ApiError.notFound(`${entity} not found.`);
        case "P2003":
          throw ApiError.validation("A linked record does not exist.");
      }
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Compile-time check: domain enums (Schemas) mirror the Prisma enums.
// A mismatch fails `tsc`.
// ---------------------------------------------------------------------------

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

export type EnumMirrorChecks = [
  Assert<Same<Domain.ContentStatus, PrismaEnums.ContentStatus>>,
  Assert<Same<Domain.UserRole, PrismaEnums.UserRole>>,
  Assert<Same<Domain.UserStatus, PrismaEnums.UserStatus>>,
  Assert<Same<Domain.PasswordTokenPurpose, PrismaEnums.PasswordTokenPurpose>>,
  Assert<Same<Domain.ProjectSector, PrismaEnums.ProjectSector>>,
  Assert<Same<Domain.ProjectStatus, PrismaEnums.ProjectStatus>>,
  Assert<Same<Domain.PartnerType, PrismaEnums.PartnerType>>,
  Assert<Same<Domain.MessageStatus, PrismaEnums.MessageStatus>>,
];
