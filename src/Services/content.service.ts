import { ApiError } from "@/lib/api/api-error";
import { pageMeta, type PageMeta } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/auth-guard";
import { cachedContent, revalidateContent, type ContentModule } from "@/lib/cache";
import { uniqueSlug } from "@/lib/slug";
import type {
  ContentRecord,
  ContentRepository,
  StatusCounts,
} from "@/Repositories/repository-utils";
import type { ContentStatus, ListQuery } from "@/Schemas/common.schema";
import { activityService } from "@/Services/activity.service";

/*
 * Shared lifecycle for every editorial module: listing, slugs, status
 * transitions, publish rules, activity logging and cache revalidation.
 * Each module's service passes in what is specific to it.
 */

/** Allowed status transitions. New records always start as DRAFT. */
export const STATUS_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  DRAFT: ["REVIEW", "PUBLISHED"],
  REVIEW: ["PUBLISHED", "DRAFT"],
  PUBLISHED: ["ARCHIVED", "DRAFT"],
  ARCHIVED: ["DRAFT"],
};

export function canTransition(from: ContentStatus, to: ContentStatus) {
  return STATUS_TRANSITIONS[from].includes(to);
}

/** DTO fields shared by every content module (dates as ISO strings). */
export type ContentDtoBase = {
  id: string;
  slug: string;
  status: ContentStatus;
  publishedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function toContentDtoBase(record: ContentRecord): ContentDtoBase {
  return {
    id: record.id,
    slug: record.slug,
    status: record.status,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export type ContentServiceConfig<
  TRecord extends ContentRecord,
  TCreate extends { slug?: string },
  TUpdate extends { slug?: string },
  TDto,
> = {
  module: ContentModule;
  /** Stored in ActivityLog.entityType, e.g. "project". */
  entityType: string;
  /** Human label for messages, e.g. "Project". */
  label: string;
  repository: ContentRepository<TRecord, TCreate, TUpdate>;
  toDto: (record: TRecord) => TDto;
  /** Display title for activity summaries. */
  titleOf: (record: TRecord) => string;
  /** Text the slug is generated from when none is supplied. */
  slugSource: (input: TCreate) => string;
  /** Reasons the record cannot be published yet (empty = OK). */
  publishProblems?: (record: TRecord) => string[];
};

/** What route factories and pages rely on. */
export type ContentServiceApi<TCreate, TUpdate, TDto> = {
  module: ContentModule;
  list(query: ListQuery): Promise<{ items: TDto[]; meta: PageMeta }>;
  getById(id: string): Promise<TDto>;
  create(input: TCreate, actor: Actor): Promise<TDto>;
  update(id: string, input: TUpdate, actor: Actor): Promise<TDto>;
  remove(id: string, actor: Actor): Promise<{ id: string }>;
  setStatus(id: string, status: ContentStatus, actor: Actor): Promise<TDto>;
  listPublished(): Promise<TDto[]>;
  getPublishedBySlug(slug: string): Promise<TDto | null>;
  countByStatus(): Promise<StatusCounts>;
};

export function createContentService<
  TRecord extends ContentRecord,
  TCreate extends { slug?: string },
  TUpdate extends { slug?: string },
  TDto,
>(config: ContentServiceConfig<TRecord, TCreate, TUpdate, TDto>): ContentServiceApi<TCreate, TUpdate, TDto> {
  const { module, entityType, label, repository, toDto, titleOf } = config;

  async function getRecord(id: string): Promise<TRecord> {
    const record = await repository.findById(id);
    if (!record) throw ApiError.notFound(`${label} not found.`);
    return record;
  }

  async function assertSlugFree(slug: string, excludeId?: string) {
    if (await repository.slugExists(slug, excludeId)) {
      throw ApiError.conflict(`Another ${label.toLowerCase()} already uses this slug.`, {
        slug: "This slug is already in use",
      });
    }
  }

  function log(actor: Actor, action: string, record: TRecord, summary: string) {
    return activityService.record(actor, { action, entityType, entityId: record.id, summary });
  }

  return {
    module,

    async list(query) {
      const { items, total } = await repository.list(query);
      return { items: items.map(toDto), meta: pageMeta(query.page, query.pageSize, total) };
    },

    async getById(id) {
      return toDto(await getRecord(id));
    },

    async create(input, actor) {
      const { slug: requested, ...fields } = input;
      let slug: string;
      if (requested) {
        await assertSlugFree(requested);
        slug = requested;
      } else {
        slug = await uniqueSlug(config.slugSource(input), (candidate) =>
          repository.slugExists(candidate),
        );
      }

      const record = await repository.create({ ...fields, slug, status: "DRAFT", publishedAt: null });
      await log(actor, "created", record, `Created ${label.toLowerCase()} "${titleOf(record)}"`);
      return toDto(record);
    },

    async update(id, input, actor) {
      const existing = await getRecord(id);
      const { slug: requested, ...fields } = input;
      const slugChange = requested && requested !== existing.slug ? requested : undefined;
      if (slugChange) await assertSlugFree(slugChange, id);

      const record = await repository.update(id, { ...fields, ...(slugChange ? { slug: slugChange } : {}) });
      await log(actor, "updated", record, `Updated ${label.toLowerCase()} "${titleOf(record)}"`);
      if (existing.status === "PUBLISHED") revalidateContent(module, [existing.slug, record.slug]);
      return toDto(record);
    },

    async remove(id, actor) {
      const existing = await getRecord(id);
      await repository.delete(id);
      await log(actor, "deleted", existing, `Deleted ${label.toLowerCase()} "${titleOf(existing)}"`);
      if (existing.status === "PUBLISHED") revalidateContent(module, [existing.slug]);
      return { id };
    },

    async setStatus(id, status, actor) {
      const existing = await getRecord(id);
      if (existing.status === status) return toDto(existing);

      if (!canTransition(existing.status, status)) {
        throw ApiError.validation(`A ${existing.status.toLowerCase()} ${label.toLowerCase()} cannot move to ${status.toLowerCase()}.`, {
          status: `Allowed: ${STATUS_TRANSITIONS[existing.status].join(", ")}`,
        });
      }

      if (status === "PUBLISHED") {
        const problems = config.publishProblems?.(existing) ?? [];
        if (problems.length) {
          throw ApiError.validation(`This ${label.toLowerCase()} is not ready to publish.`, {
            publish: problems,
          });
        }
      }

      const record = await repository.update(id, {
        status,
        // Set on first publish, kept on re-publish.
        ...(status === "PUBLISHED" ? { publishedAt: existing.publishedAt ?? new Date() } : {}),
      } as Parameters<typeof repository.update>[1]);

      await log(
        actor,
        "status_changed",
        record,
        `Moved ${label.toLowerCase()} "${titleOf(record)}" from ${existing.status} to ${status}`,
      );
      if (existing.status === "PUBLISHED" || status === "PUBLISHED") {
        revalidateContent(module, [record.slug]);
      }
      return toDto(record);
    },

    listPublished() {
      return cachedContent(module, ["published"], async () =>
        (await repository.listPublished()).map(toDto),
      );
    },

    getPublishedBySlug(slug) {
      return cachedContent(module, ["slug", slug], async () => {
        const record = await repository.findPublishedBySlug(slug);
        return record ? toDto(record) : null;
      });
    },

    countByStatus() {
      return repository.countByStatus();
    },
  };
}
