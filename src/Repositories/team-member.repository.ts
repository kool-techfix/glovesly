import type { TeamMember, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  pageArgs,
  searchFilter,
  toStatusCounts,
  withPrismaErrors,
  type ContentRepository,
} from "@/Repositories/repository-utils";
import type { TeamCreateInput, TeamUpdateInput } from "@/Schemas/team.schema";

export type TeamMemberRecord = TeamMember;

const ENTITY = "Team member";

export const teamMemberRepository: ContentRepository<TeamMemberRecord, TeamCreateInput, TeamUpdateInput> = {
  async list(params) {
    const where: Prisma.TeamMemberWhereInput = {
      ...searchFilter(["name", "role"], params.search),
      ...(params.status ? { status: params.status } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.teamMember.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return getPrisma().teamMember.findUnique({ where: { id } });
  },

  async slugExists(slug, excludeId) {
    const count = await getPrisma().teamMember.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  },

  create(data) {
    return withPrismaErrors(() => getPrisma().teamMember.create({ data }), ENTITY);
  },

  update(id, data) {
    return withPrismaErrors(() => getPrisma().teamMember.update({ where: { id }, data }), ENTITY);
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().teamMember.delete({ where: { id } }), ENTITY);
  },

  listPublished() {
    return getPrisma().teamMember.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  findPublishedBySlug(slug) {
    return getPrisma().teamMember.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async countByStatus() {
    const rows = await getPrisma().teamMember.groupBy({ by: ["status"], _count: { _all: true } });
    return toStatusCounts(rows);
  },
};
