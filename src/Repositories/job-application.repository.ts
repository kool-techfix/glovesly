import type { JobApplication, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { pageArgs, searchFilter, withPrismaErrors, type ListResult } from "@/Repositories/repository-utils";
import type { ApplicationStatus } from "@/Schemas/common.schema";

/*
 * Job applications (careers). Not a content module: no slug or publish
 * workflow, like the contact messages inbox.
 */

const WITH_VACANCY = { vacancy: { select: { id: true, slug: true, title: true, status: true } } } as const;
export type JobApplicationRecord = JobApplication & {
  vacancy: { id: string; slug: string; title: string; status: string } | null;
};

const ENTITY = "Application";

export const jobApplicationRepository = {
  create(data: {
    vacancyId: string | null;
    positionLabel: string;
    fullName: string;
    email: string;
    phone: string;
    message: string | null;
    cvPublicId: string;
    cvFilename: string;
    cvBytes: number;
    consent: boolean;
  }): Promise<JobApplicationRecord> {
    return getPrisma().jobApplication.create({ data, include: WITH_VACANCY });
  },

  async list(params: {
    search?: string;
    status?: ApplicationStatus;
    vacancyId?: string;
    page: number;
    pageSize: number;
  }): Promise<ListResult<JobApplicationRecord>> {
    const where: Prisma.JobApplicationWhereInput = {
      ...searchFilter(["fullName", "email"], params.search),
      ...(params.status ? { status: params.status } : {}),
      ...(params.vacancyId === "general" ? { vacancyId: null } : params.vacancyId ? { vacancyId: params.vacancyId } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: WITH_VACANCY,
        orderBy: { createdAt: "desc" },
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.jobApplication.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<JobApplicationRecord | null> {
    return getPrisma().jobApplication.findUnique({ where: { id }, include: WITH_VACANCY });
  },

  update(id: string, data: { status: ApplicationStatus }) {
    return withPrismaErrors(() => getPrisma().jobApplication.update({ where: { id }, data, include: WITH_VACANCY }), ENTITY);
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().jobApplication.delete({ where: { id }, include: WITH_VACANCY }), ENTITY);
  },

  countByStatus(status: ApplicationStatus): Promise<number> {
    return getPrisma().jobApplication.count({ where: { status } });
  },

  /** Same email, same vacancy (or both general), since `since`. */
  countRecent(email: string, vacancyId: string | null, since: Date): Promise<number> {
    return getPrisma().jobApplication.count({ where: { email, vacancyId, createdAt: { gte: since } } });
  },

  /** Vacancies that have applications, for the admin filter. */
  async listPositions(): Promise<Array<{ id: string; title: string }>> {
    const rows = await getPrisma().vacancy.findMany({
      where: { applications: { some: {} } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
    return rows;
  },
};
