import type { Actor } from "@/lib/auth/auth-guard";
import { pageMeta } from "@/lib/api/response";
import { activityLogRepository, type ActivityLogRecord } from "@/Repositories/activity-log.repository";
import type { ActivityListQuery } from "@/Schemas/activity.schema";

export type ActivityDto = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  actor: { id: string; name: string; email: string } | null;
  createdAt: string;
};

function toActivityDto(record: ActivityLogRecord): ActivityDto {
  return {
    id: record.id,
    action: record.action,
    entityType: record.entityType,
    entityId: record.entityId,
    summary: record.summary,
    actor: record.actor,
    createdAt: record.createdAt.toISOString(),
  };
}

export const activityService = {
  /**
   * Writes an audit entry. Never throws: the mutation it describes has
   * already happened, so a logging failure is reported, not surfaced.
   */
  async record(
    actor: Pick<Actor, "id"> | null,
    entry: { action: string; entityType: string; entityId?: string | null; summary?: string | null },
  ): Promise<void> {
    try {
      await activityLogRepository.create({ actorId: actor?.id ?? null, ...entry });
    } catch (error) {
      console.error("[activity] Failed to record activity", entry, error);
    }
  },

  async list(query: ActivityListQuery) {
    const { items, total } = await activityLogRepository.list(query);
    return { items: items.map(toActivityDto), meta: pageMeta(query.page, query.pageSize, total) };
  },
};
