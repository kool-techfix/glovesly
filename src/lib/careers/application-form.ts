import { z } from "zod";

/*
 * The application form's fields, shared by the client form (react-hook-form)
 * and POST /api/public/applications. Client-safe: no server imports. The CV
 * file is checked separately (cv-rules.ts on the client, cv-file.ts on the
 * server), because a File is not part of this schema.
 */

export const APPLICATION_HONEYPOT_FIELD = "website_url";
export const APPLICATION_MESSAGE_MAX = 2000;
export const GENERAL_APPLICATION_LABEL = "General application";

/** Accepts +234 and local Nigerian numbers, and other international numbers. */
export function normalisePhone(value: string): string {
  return value.replace(/[\s().-]/g, "");
}
const PHONE_PATTERN = /^\+?\d{7,15}$/;

export const applicationFieldsSchema = z.object({
  fullName: z
    .string({ required_error: "Enter your full name" })
    .trim()
    .min(2, "Enter your full name")
    .max(120, "Your name must be at most 120 characters"),
  email: z
    .string({ required_error: "Enter your email address" })
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address")
    .max(254, "Your email address is too long")
    .email("Enter a valid email address, like name@example.com"),
  phone: z
    .string({ required_error: "Enter your phone number" })
    .trim()
    .min(1, "Enter your phone number")
    .refine((value) => PHONE_PATTERN.test(normalisePhone(value)), {
      message: "Enter a valid phone number, like +234 803 123 4567 or 0803 123 4567",
    }),
  message: z
    .string()
    .trim()
    .max(APPLICATION_MESSAGE_MAX, `Your message must be at most ${APPLICATION_MESSAGE_MAX} characters`)
    .optional()
    .transform((value) => (value ? value : undefined)),
  /** "true" from a multipart form, true from the client. */
  consent: z
    .union([z.boolean(), z.literal("true"), z.literal("on"), z.literal("false"), z.literal("")])
    .optional()
    .transform((value) => value === true || value === "true" || value === "on")
    .refine((value) => value, { message: "Tick the box to agree to us processing your application" }),
  /** Empty for a general application. */
  vacancyId: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((value) => (value ? value : undefined)),
  /** General applications only: a service title or "Other". */
  areaOfInterest: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : undefined)),
  [APPLICATION_HONEYPOT_FIELD]: z.string().max(500).optional(),
});

export type ApplicationFieldsInput = z.input<typeof applicationFieldsSchema>;
export type ApplicationFields = z.output<typeof applicationFieldsSchema>;
