import { z } from "zod";

import { emailSchema } from "@/Schemas/auth.schema";
import { messageStatusSchema, optionalText, text } from "@/Schemas/common.schema";

/**
 * Honeypot field. Hidden from people with CSS, but bots fill it in. Not named
 * "company" (ICAADA's choice) because company is a real field on this form.
 */
export const CONTACT_HONEYPOT_FIELD = "website_url";

export const contactSubmitSchema = z.object({
  name: text(120, "Name"),
  email: emailSchema,
  phone: optionalText(40, "Phone"),
  company: optionalText(160, "Company"),
  subject: optionalText(200, "Subject"),
  message: text(5000, "Message"),
  [CONTACT_HONEYPOT_FIELD]: z.string().max(500).optional(),
});
export type ContactSubmitInput = z.infer<typeof contactSubmitSchema>;

export const messageListQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: messageStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;

export const messageUpdateSchema = z
  .object({
    status: messageStatusSchema,
    replyDraft: optionalText(10_000, "Reply draft"),
  })
  .partial();
export type MessageUpdateInput = z.infer<typeof messageUpdateSchema>;
