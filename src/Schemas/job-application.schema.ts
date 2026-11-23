import { z } from "zod";

import { applicationStatusSchema, idSchema } from "@/Schemas/common.schema";

export {
  APPLICATION_HONEYPOT_FIELD,
  applicationFieldsSchema,
  type ApplicationFields,
} from "@/lib/careers/application-form";

export const applicationListQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: applicationStatusSchema.optional(),
  /** A vacancy id, or "general" for general applications. */
  vacancyId: z
    .union([idSchema, z.literal("general"), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;

/** Staff can only change the status. */
export const applicationUpdateSchema = z.object({ status: applicationStatusSchema });
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
