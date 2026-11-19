import type { Service, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  pageArgs,
  searchFilter,
  toStatusCounts,
  withPrismaErrors,
  type ContentRepository,
} from "@/Repositories/repository-utils";
import type { ServiceCreateInput, ServiceUpdateInput } from "@/Schemas/service.schema";

export type ServiceRecord = Service;

const ENTITY = "Service";

export const serviceRepository: ContentRepository<ServiceRecord, ServiceCreateInput, ServiceUpdateInput> = {
  async list(params) {
    const where: Prisma.ServiceWhereInput = {
      ...searchFilter(["title", "summary"], params.search),
      ...(params.status ? { status: params.status } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await prisma.$transaction([
      prisma.service.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.service.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return getPrisma().service.findUnique({ where: { id } });
  },

  async slugExists(slug, excludeId) {
    const count = await getPrisma().service.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  },

  create(data) {
    return withPrismaErrors(() => getPrisma().service.create({ data }), ENTITY);
  },

  update(id, data) {
    return withPrismaErrors(() => getPrisma().service.update({ where: { id }, data }), ENTITY);
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().service.delete({ where: { id } }), ENTITY);
  },

  listPublished() {
    return getPrisma().service.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
  },

  findPublishedBySlug(slug) {
    return getPrisma().service.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async countByStatus() {
    const rows = await getPrisma().service.groupBy({ by: ["status"], _count: { _all: true } });
    return toStatusCounts(rows);
  },
};
