import type { Project, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  pageArgs,
  searchFilter,
  toStatusCounts,
  withPrismaErrors,
  type ContentRepository,
} from "@/Repositories/repository-utils";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/Schemas/project.schema";

export type ProjectRecord = Project;

const ENTITY = "Project";

export const projectRepository: ContentRepository<ProjectRecord, ProjectCreateInput, ProjectUpdateInput> = {
  async list(params) {
    const where: Prisma.ProjectWhereInput = {
      ...searchFilter(["title", "summary", "client", "locationLabel", "state"], params.search),
      ...(params.status ? { status: params.status } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.project.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return getPrisma().project.findUnique({ where: { id } });
  },

  async slugExists(slug, excludeId) {
    const count = await getPrisma().project.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  },

  create(data) {
    return withPrismaErrors(() => getPrisma().project.create({ data }), ENTITY);
  },

  update(id, data) {
    return withPrismaErrors(() => getPrisma().project.update({ where: { id }, data }), ENTITY);
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().project.delete({ where: { id } }), ENTITY);
  },

  listPublished() {
    return getPrisma().project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { year: { sort: "desc", nulls: "last" } }, { title: "asc" }],
    });
  },

  findPublishedBySlug(slug) {
    return getPrisma().project.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async countByStatus() {
    const rows = await getPrisma().project.groupBy({ by: ["status"], _count: { _all: true } });
    return toStatusCounts(rows);
  },
};
