import { z } from "zod";

import {
  cloudinaryUrl,
  contentBaseShape,
  idSchema,
  longText,
  optionalPublicId,
  stringList,
  text,
} from "@/Schemas/common.schema";

export const newsCreateSchema = z.object({
  ...contentBaseShape,
  title: text(200, "Title"),
  excerpt: longText(500, "Excerpt"),
  body: longText(50_000, "Body"),
  coverImageUrl: cloudinaryUrl,
  coverImagePublicId: optionalPublicId,
  tags: stringList(10, 40, "tag"),
  /** Defaults to the signed-in user on create. Null clears it. */
  authorId: idSchema.nullish(),
});
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;

export const newsUpdateSchema = newsCreateSchema.partial();
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
