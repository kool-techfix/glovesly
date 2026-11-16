import { z } from "zod";

import { emailSchema, newPasswordSchema } from "@/Schemas/auth.schema";
import { text, userRoleSchema, userStatusSchema } from "@/Schemas/common.schema";

/** Admin invites a user: created without a password, sent an invite link. */
export const userCreateSchema = z.object({
  email: emailSchema,
  name: text(120, "Name"),
  role: userRoleSchema.default("EDITOR"),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

/** Admin edit. `password` sets it directly and signs the user out everywhere. */
export const userUpdateSchema = z
  .object({
    name: text(120, "Name"),
    role: userRoleSchema,
    status: userStatusSchema,
    password: newPasswordSchema,
  })
  .partial();
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const userListQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : undefined)),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type UserListQuery = z.infer<typeof userListQuerySchema>;

