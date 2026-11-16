import { z } from "zod";

export const activityListQuerySchema = z.object({
  entityType: z.string().trim().max(50).optional(),
  actorId: z.string().trim().max(64).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
