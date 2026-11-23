import { z } from "zod";

import { nigeriaStateSchema } from "@/lib/nigeria-states";
import { emailSchema } from "@/Schemas/auth.schema";
import { latitudeSchema, longitudeSchema, optionalText, text } from "@/Schemas/common.schema";

export const officeLocationSchema = z.object({
  name: text(120, "Office name"),
  state: nigeriaStateSchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  isHeadOffice: z.boolean().default(false),
});
export type OfficeLocation = z.infer<typeof officeLocationSchema>;

export const officeLocationsSchema = z
  .array(officeLocationSchema)
  .max(20, "At most 20 office locations")
  .refine((offices) => offices.filter((office) => office.isHeadOffice).length <= 1, {
    message: "Only one office can be the head office",
  })
  .refine(
    (offices) => offices.every((office) => (office.latitude === null) === (office.longitude === null)),
    { message: "Set both latitude and longitude for an office, or leave both empty" },
  );

/** Figures shown beside the Nigeria map, e.g. { label: "Projects delivered", value: "120+" }. */
export const statSchema = z.object({
  label: text(80, "Stat label"),
  value: text(40, "Stat value"),
});
export type Stat = z.infer<typeof statSchema>;

export const statsSchema = z.array(statSchema).max(8, "At most 8 stats");

export const settingsUpdateSchema = z
  .object({
    contactEmail: z
      .union([z.literal(""), emailSchema])
      .nullish()
      .transform((value) => (value ? value : null)),
    /** Job application alerts; falls back to contactEmail when empty. */
    recruitmentEmail: z
      .union([z.literal(""), emailSchema])
      .nullish()
      .transform((value) => (value ? value : null)),
    phone: optionalText(40, "Phone"),
    address: optionalText(300, "Address"),
    officeLocations: officeLocationsSchema,
    stats: statsSchema,
  })
  .partial();
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
