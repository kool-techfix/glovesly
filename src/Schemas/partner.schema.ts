import { z } from "zod";

import {
  cloudinaryUrl,
  contentBaseShape,
  optionalPublicId,
  optionalUrl,
  partnerTypeSchema,
  text,
} from "@/Schemas/common.schema";

export const partnerCreateSchema = z.object({
  ...contentBaseShape,
  name: text(160, "Name"),
  logoUrl: cloudinaryUrl,
  logoPublicId: optionalPublicId,
  websiteUrl: optionalUrl,
  type: partnerTypeSchema,
});
export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>;

export const partnerUpdateSchema = partnerCreateSchema.partial();
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>;
