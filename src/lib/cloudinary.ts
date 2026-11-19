import { createHash } from "node:crypto";

import {
  UPLOAD_FOLDERS,
  UPLOAD_RESOURCE_TYPES,
  type UploadFolder,
  type UploadResourceType,
} from "@/lib/domain";
import { getEnv } from "@/lib/env";

/*
 * Signed direct uploads: the server signs, the browser POSTs the file straight
 * to Cloudinary, then saves the returned secure_url and public_id on a record.
 * No file bytes pass through this app.
 */

export const UPLOAD_ROOT_FOLDER = "glovesly";

export { UPLOAD_FOLDERS, UPLOAD_RESOURCE_TYPES, type UploadFolder, type UploadResourceType };

export type UploadSignature = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/** Cloudinary signature: SHA-1 of the sorted params string followed by the API secret. */
function signParams(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export function signUpload(options: {
  folder: UploadFolder;
  resourceType: UploadResourceType;
}): UploadSignature {
  const env = getEnv();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${UPLOAD_ROOT_FOLDER}/${options.folder}`;
  const signature = signParams({ folder, timestamp }, env.CLOUDINARY_API_SECRET);

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${options.resourceType}/upload`,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  };
}

/** Allow-list check: only https://res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/… URLs. */
export function isCloudinaryUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  const cloudName = getEnv().CLOUDINARY_CLOUD_NAME;
  return (
    url.protocol === "https:" &&
    url.hostname === "res.cloudinary.com" &&
    url.pathname.startsWith(`/${cloudName}/`)
  );
}
