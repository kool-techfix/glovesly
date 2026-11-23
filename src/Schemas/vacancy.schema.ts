import { z } from "zod";

import { lagosEndOfDay } from "@/lib/lagos-date";
import {
  contentBaseShape,
  employmentTypeSchema,
  longText,
  optionalText,
  stringList,
  text,
} from "@/Schemas/common.schema";

/** Deadline from the admin date field ("YYYY-MM-DD"), stored as the end of that day in Lagos. Empty → null. */
const deadlineSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    const trimmed = value.trim();
    const date = lagosEndOfDay(trimmed.slice(0, 10));
    if (!date) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter the deadline as a date (YYYY-MM-DD)" });
      return z.NEVER;
    }
    return date;
  });

/** Short single-line text that may be empty in a draft (publish rules require it). */
const draftLine = (max: number, label: string) =>
  z
    .string({ invalid_type_error: `${label} must be text` })
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .default("");

const vacancyShape = {
  ...contentBaseShape,
  title: text(200, "Title"),
  department: draftLine(120, "Department"),
  employmentType: employmentTypeSchema.nullish(),
  location: draftLine(160, "Location"),
  summary: longText(400, "Summary"),
  overview: longText(10_000, "Overview"),
  responsibilities: stringList(30, 400, "responsibility"),
  requirements: stringList(30, 400, "requirement"),
  applicationNote: optionalText(2000, "Application note"),
  deadline: deadlineSchema,
};

export const vacancyCreateSchema = z.object(vacancyShape);
export type VacancyCreateInput = z.infer<typeof vacancyCreateSchema>;

export const vacancyUpdateSchema = z.object(vacancyShape).partial();
export type VacancyUpdateInput = z.infer<typeof vacancyUpdateSchema>;
