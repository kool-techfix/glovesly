import { z } from "zod";

import {
  cloudinaryUrl,
  contentBaseShape,
  optionalPublicId,
  optionalUrl,
  partnerTypeSchema,
  text,
} from "@/Schemas/common.schema";

/** Intrinsic pixel size: a positive integer, or empty/null for "unknown". */
const optionalDimension = (label: string) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.coerce
      .number({ invalid_type_error: `${label} must be a number` })
      .int(`${label} must be a whole number of pixels`)
      .positive(`${label} must be greater than 0`)
      .max(20_000, `${label} is too large`)
      .nullish(),
  );

const partnerShape = {
  ...contentBaseShape,
  name: text(160, "Name"),
  /** Logo for LIGHT backgrounds (dark artwork). Required to publish. */
  logoUrl: cloudinaryUrl,
  logoPublicId: optionalPublicId,
  /** Optional white or light version for DARK backgrounds. */
  logoOnDarkUrl: cloudinaryUrl,
  logoOnDarkPublicId: optionalPublicId,
  /** Intrinsic size of logoUrl. Optional: admin uploads do not send it. */
  logoWidth: optionalDimension("Logo width"),
  logoHeight: optionalDimension("Logo height"),
  websiteUrl: optionalUrl,
  type: partnerTypeSchema,
};

type PartnerFields = {
  logoOnDarkUrl?: string | null;
  logoOnDarkPublicId?: string | null;
  logoWidth?: number | null;
  logoHeight?: number | null;
};

/**
 * Cross-field rules. Only checked for keys present in the input, so a partial
 * update that does not touch these fields is not affected.
 */
function checkLogoFields(input: PartnerFields, ctx: z.RefinementCtx) {
  if ("logoOnDarkUrl" in input && input.logoOnDarkUrl) {
    const publicId = input.logoOnDarkPublicId;
    if (!publicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["logoOnDarkPublicId"],
        message: "The dark-background logo needs its Cloudinary public ID",
      });
    } else if (!new URL(input.logoOnDarkUrl).pathname.includes(`/${publicId}`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["logoOnDarkPublicId"],
        message: "The public ID does not match the dark-background logo URL",
      });
    }
  }
  const hasWidth = input.logoWidth != null;
  const hasHeight = input.logoHeight != null;
  if (("logoWidth" in input || "logoHeight" in input) && hasWidth !== hasHeight) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [hasWidth ? "logoHeight" : "logoWidth"],
      message: "Set both logo width and height, or leave both empty",
    });
  }
}

export const partnerCreateSchema = z.object(partnerShape).superRefine(checkLogoFields);
export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>;

export const partnerUpdateSchema = z.object(partnerShape).partial().superRefine(checkLogoFields);
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>;
