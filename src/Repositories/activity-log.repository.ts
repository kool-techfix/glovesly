import type { ActivityLog, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { pageArgs, type ListResult } from "@/Repositories/repository-utils";

export type ActivityLogRecord = ActivityLog & {
  actor: { id: string; name: string; email: string } | null;
};

export const activityLogRepository = {
  create(data: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    summary?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    return getPrisma().activityLog.create({ data });
  },

  async list(params: {
    entityType?: string;
    actorId?: string;
    page: number;
    pageSize: number;
  }): Promise<ListResult<ActivityLogRecord>> {
    const where: Prisma.ActivityLogWhereInput = {
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.actorId ? { actorId: params.actorId } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { id: true, name: true, email: true } } },
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.activityLog.count({ where }),
    ]);
    return { items, total };
  },
};
