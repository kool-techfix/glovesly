import type { Prisma, Vacancy } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  pageArgs,
  searchFilter,
  toStatusCounts,
  withPrismaErrors,
  type ContentRepository,
} from "@/Repositories/repository-utils";
import type { VacancyCreateInput, VacancyUpdateInput } from "@/Schemas/vacancy.schema";

/** Every read carries the application count (shown in the admin list). */
const WITH_COUNT = { _count: { select: { applications: true } } } as const;
export type VacancyRecord = Vacancy & { _count: { applications: number } };

const ENTITY = "Vacancy";
const PUBLIC_ORDER: Prisma.VacancyOrderByWithRelationInput[] = [{ sortOrder: "asc" }, { publishedAt: "desc" }, { title: "asc" }];

export const vacancyRepository: ContentRepository<VacancyRecord, VacancyCreateInput, VacancyUpdateInput> & {
  listDepartments(): Promise<string[]>;
  findOpenCandidate(id: string): Promise<VacancyRecord | null>;
} = {
  async list(params) {
    const where: Prisma.VacancyWhereInput = {
      ...searchFilter(["title", "department", "location", "summary"], params.search),
      ...(params.status ? { status: params.status } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        include: WITH_COUNT,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.vacancy.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return getPrisma().vacancy.findUnique({ where: { id }, include: WITH_COUNT });
  },

  async slugExists(slug, excludeId) {
    const count = await getPrisma().vacancy.count({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } });
    return count > 0;
  },

  create(data) {
    return withPrismaErrors(() => getPrisma().vacancy.create({ data, include: WITH_COUNT }), ENTITY);
  },

  update(id, data) {
    return withPrismaErrors(() => getPrisma().vacancy.update({ where: { id }, data, include: WITH_COUNT }), ENTITY);
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().vacancy.delete({ where: { id }, include: WITH_COUNT }), ENTITY);
  },

  /** PUBLISHED rows; the service drops those past their deadline at request time. */
  listPublished() {
    return getPrisma().vacancy.findMany({ where: { status: "PUBLISHED" }, include: WITH_COUNT, orderBy: PUBLIC_ORDER });
  },

  findPublishedBySlug(slug) {
    return getPrisma().vacancy.findFirst({ where: { slug, status: "PUBLISHED" }, include: WITH_COUNT });
  },

  /** For an application: the row if it exists and is PUBLISHED (the deadline is checked by the service). */
  findOpenCandidate(id) {
    return getPrisma().vacancy.findFirst({ where: { id, status: "PUBLISHED" }, include: WITH_COUNT });
  },

  async countByStatus() {
    const rows = await getPrisma().vacancy.groupBy({ by: ["status"], _count: { _all: true } });
    return toStatusCounts(rows);
  },

  /** Distinct non-empty departments, for the admin's suggestions. */
  async listDepartments() {
    const rows = await getPrisma().vacancy.findMany({
      where: { department: { not: "" } },
      distinct: ["department"],
      select: { department: true },
      orderBy: { department: "asc" },
    });
    return rows.map((row) => row.department);
  },
};
