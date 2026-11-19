import { z } from "zod";

import {
  cloudinaryUrl,
  contentBaseShape,
  longText,
  optionalPublicId,
  stringList,
  text,
} from "@/Schemas/common.schema";

export const serviceCreateSchema = z.object({
  ...contentBaseShape,
  title: text(160, "Title"),
  summary: longText(500, "Summary"),
  body: longText(20_000, "Body"),
  capabilities: stringList(20, 160, "capability"),
  imageUrl: cloudinaryUrl,
  imagePublicId: optionalPublicId,
});
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;

export const serviceUpdateSchema = serviceCreateSchema.partial();
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
