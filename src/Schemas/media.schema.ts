import { z } from "zod";

import { UPLOAD_FOLDERS, UPLOAD_RESOURCE_TYPES } from "@/lib/cloudinary";

export const signUploadSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS),
  resourceType: z.enum(UPLOAD_RESOURCE_TYPES).default("image"),
});
export type SignUploadInput = z.infer<typeof signUploadSchema>;
