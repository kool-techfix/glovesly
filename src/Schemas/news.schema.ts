import { z } from "zod";

import {
  cloudinaryUrl,
  contentBaseShape,
  idSchema,
  longText,
  optionalPublicId,
  optionalText,
  stringList,
  text,
} from "@/Schemas/common.schema";

/** Optional https link to the outlet's report. Empty → null. */
const sourceUrl = z
  .string()
  .trim()
  .max(500, "Source link must be at most 500 characters")
  .nullish()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || isHttpsUrl(value), {
    message: "Source link must be a full https:// address",
  });

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !/\s/.test(value);
  } catch {
    return false;
  }
}

const newsShape = {
  ...contentBaseShape,
  title: text(200, "Title"),
  excerpt: longText(500, "Excerpt"),
  body: longText(50_000, "Body"),
  coverImageUrl: cloudinaryUrl,
  coverImagePublicId: optionalPublicId,
  tags: stringList(10, 40, "tag"),
  /** Defaults to the signed-in user on create. Null clears it. */
  authorId: idSchema.nullish(),
  /** Outlet that first reported the story, e.g. "Daily Trust". */
  sourceName: optionalText(120, "Source name"),
  sourceUrl,
};

type SourceFields = { sourceName?: string | null; sourceUrl?: string | null };

/** Source name and link must be both set or both empty. Returns the field that is missing. */
export function missingSourceField(input: SourceFields): "sourceName" | "sourceUrl" | null {
  if (input.sourceUrl && !input.sourceName) return "sourceName";
  if (input.sourceName && !input.sourceUrl) return "sourceUrl";
  return null;
}

export const SOURCE_PAIR_MESSAGES = {
  sourceName: "Add the source name for this link",
  sourceUrl: "Add the link to the original report",
} as const;

/**
 * On create a missing key means empty, so the pair is always checked. On
 * update it is checked here only when both keys are sent (the admin form
 * sends every field); an update that sends one of them is checked against
 * the stored row by newsService.update.
 */
function checkSourcePair(mode: "create" | "update") {
  return (input: SourceFields & CoverFields, ctx: z.RefinementCtx) => {
    if (!(mode === "update" && (!("sourceName" in input) || !("sourceUrl" in input)))) {
      const missing = missingSourceField(input);
      if (missing) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [missing], message: SOURCE_PAIR_MESSAGES[missing] });
    }
    checkCoverPair(mode, input, ctx);
  };
}

type CoverFields = { coverImageUrl?: string | null; coverImagePublicId?: string | null };

/**
 * The cover image is optional, but its URL and Cloudinary public ID go
 * together: both set or both empty. Checked when both keys are sent (the
 * admin form always sends both) and always on create.
 */
function checkCoverPair(mode: "create" | "update", input: CoverFields, ctx: z.RefinementCtx) {
  if (mode === "update" && (!("coverImageUrl" in input) || !("coverImagePublicId" in input))) return;
  if (input.coverImageUrl && !input.coverImagePublicId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["coverImagePublicId"], message: "Upload the image again so its Cloudinary ID is saved too" });
  }
  if (input.coverImagePublicId && !input.coverImageUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["coverImageUrl"], message: "The image link is missing; upload the image again or remove it" });
  }
}

export const newsCreateSchema = z.object(newsShape).superRefine(checkSourcePair("create"));
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;

export const newsUpdateSchema = z.object(newsShape).partial().superRefine(checkSourcePair("update"));
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
