import type { Partner, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  pageArgs,
  searchFilter,
  toStatusCounts,
  withPrismaErrors,
  type ContentRepository,
} from "@/Repositories/repository-utils";
import type { PartnerCreateInput, PartnerUpdateInput } from "@/Schemas/partner.schema";

export type PartnerRecord = Partner;

const ENTITY = "Partner";

export const partnerRepository: ContentRepository<PartnerRecord, PartnerCreateInput, PartnerUpdateInput> = {
  async list(params) {
    const where: Prisma.PartnerWhereInput = {
      ...searchFilter(["name"], params.search),
      ...(params.status ? { status: params.status } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await prisma.$transaction([
      prisma.partner.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.partner.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return getPrisma().partner.findUnique({ where: { id } });
  },

  async slugExists(slug, excludeId) {
    const count = await getPrisma().partner.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  },

  create(data) {
    return withPrismaErrors(() => getPrisma().partner.create({ data }), ENTITY);
  },

  update(id, data) {
    return withPrismaErrors(() => getPrisma().partner.update({ where: { id }, data }), ENTITY);
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().partner.delete({ where: { id } }), ENTITY);
  },

  listPublished() {
    return getPrisma().partner.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  findPublishedBySlug(slug) {
    return getPrisma().partner.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async countByStatus() {
    const rows = await getPrisma().partner.groupBy({ by: ["status"], _count: { _all: true } });
    return toStatusCounts(rows);
  },
};
