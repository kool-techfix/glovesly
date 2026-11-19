import { z } from "zod";

import {
  cloudinaryUrl,
  contentBaseShape,
  longText,
  optionalPublicId,
  optionalUrl,
  text,
} from "@/Schemas/common.schema";

export const teamCreateSchema = z.object({
  ...contentBaseShape,
  name: text(120, "Name"),
  role: text(120, "Role"),
  bio: longText(5000, "Bio"),
  photoUrl: cloudinaryUrl,
  photoPublicId: optionalPublicId,
  linkedinUrl: optionalUrl,
});
export type TeamCreateInput = z.infer<typeof teamCreateSchema>;

export const teamUpdateSchema = teamCreateSchema.partial();
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;
