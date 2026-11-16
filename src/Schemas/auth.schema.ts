import { z } from "zod";

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .email("Enter a valid email address");

/** bcrypt only reads the first 72 bytes, so cap there. */
export const newPasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(12, "Use at least 12 characters")
  .refine((value) => new TextEncoder().encode(value).length <= 72, {
    message: "Password is too long (72 bytes maximum)",
  });

export const loginSchema = z.object({
  email: emailSchema,
  // No strength rules on login: just bound the input.
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required").max(1024),
  remember: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const passwordTokenSchema = z.object({
  token: z.string().trim().min(20).max(200),
});

export const resetPasswordSchema = passwordTokenSchema.extend({
  password: newPasswordSchema,
});
