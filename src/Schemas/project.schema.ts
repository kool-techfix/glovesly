import { z } from "zod";

import { isCloudinaryUrl } from "@/lib/cloudinary";
import { nigeriaStateSchema } from "@/lib/nigeria-states";
import {
  cloudinaryUrl,
  contentBaseShape,
  latitudeSchema,
  longitudeSchema,
  longText,
  optionalPublicId,
  optionalText,
  projectSectorSchema,
  projectStatusSchema,
  stringList,
  text,
} from "@/Schemas/common.schema";

export const projectCreateSchema = z.object({
  ...contentBaseShape,
  title: text(200, "Title"),
  summary: longText(500, "Summary"),
  body: longText(20_000, "Body"),
  sector: projectSectorSchema,
  client: optionalText(160, "Client"),
  locationLabel: optionalText(160, "Location"),
  state: nigeriaStateSchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  year: z.coerce
    .number({ invalid_type_error: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1950, "Year must be 1950 or later")
    .max(2100, "Year must be 2100 or earlier")
    .nullish()
    .transform((value) => value ?? null),
  projectStatus: projectStatusSchema.default("ONGOING"),
  coverImageUrl: cloudinaryUrl,
  coverImagePublicId: optionalPublicId,
  galleryUrls: z
    .array(
      z.string().trim().refine(isCloudinaryUrl, {
        message: "Each gallery image must be uploaded to this site's Cloudinary account",
      }),
    )
    .max(24, "At most 24 gallery images")
    .default([]),
  galleryPublicIds: stringList(24, 255, "gallery public id"),
});
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = projectCreateSchema.partial();
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
