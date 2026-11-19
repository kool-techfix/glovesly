import type { NewsPost, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  pageArgs,
  searchFilter,
  toStatusCounts,
  withPrismaErrors,
  type ContentRepository,
} from "@/Repositories/repository-utils";
import type { NewsCreateInput, NewsUpdateInput } from "@/Schemas/news.schema";

const AUTHOR = { author: { select: { id: true, name: true } } } as const;

export type NewsPostRecord = NewsPost & { author: { id: string; name: string } | null };

const ENTITY = "News post";

export const newsPostRepository: ContentRepository<NewsPostRecord, NewsCreateInput, NewsUpdateInput> = {
  async list(params) {
    const where: Prisma.NewsPostWhereInput = {
      ...searchFilter(["title", "excerpt"], params.search),
      ...(params.status ? { status: params.status } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.newsPost.findMany({
        where,
        include: AUTHOR,
        orderBy: [{ createdAt: "desc" }],
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.newsPost.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return getPrisma().newsPost.findUnique({ where: { id }, include: AUTHOR });
  },

  async slugExists(slug, excludeId) {
    const count = await getPrisma().newsPost.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  },

  create(data) {
    return withPrismaErrors(() => getPrisma().newsPost.create({ data, include: AUTHOR }), ENTITY);
  },

  update(id, data) {
    return withPrismaErrors(() => getPrisma().newsPost.update({ where: { id }, data, include: AUTHOR }), ENTITY);
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().newsPost.delete({ where: { id }, include: AUTHOR }), ENTITY);
  },

  listPublished() {
    return getPrisma().newsPost.findMany({
      where: { status: "PUBLISHED" },
        include: AUTHOR,
      orderBy: [{ publishedAt: "desc" }, { sortOrder: "asc" }],
    });
  },

  findPublishedBySlug(slug) {
    return getPrisma().newsPost.findFirst({ where: { slug, status: "PUBLISHED" }, include: AUTHOR });
  },

  async countByStatus() {
    const rows = await getPrisma().newsPost.groupBy({ by: ["status"], _count: { _all: true } });
    return toStatusCounts(rows);
  },
};
