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

export type ServerUploadSignature = {
  uploadUrl: string;
  /** Every field to POST with the file, including api_key and signature. */
  fields: Record<string, string>;
};

/**
 * Signed upload with a fixed public_id, for scripts (scripts/upload-partner-logos.ts).
 * overwrite + invalidate make re-runs replace the asset (and its CDN copies)
 * instead of creating duplicates. Same signing as signUpload.
 */
export function signServerUpload(options: {
  folder: UploadFolder;
  publicId: string;
  resourceType: UploadResourceType;
}): ServerUploadSignature {
  const env = getEnv();
  const params = {
    folder: `${UPLOAD_ROOT_FOLDER}/${options.folder}`,
    invalidate: "true",
    overwrite: "true",
    public_id: options.publicId,
    timestamp: Math.floor(Date.now() / 1000),
  };
  const signature = signParams(params, env.CLOUDINARY_API_SECRET);
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${options.resourceType}/upload`,
    fields: {
      ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
      api_key: env.CLOUDINARY_API_KEY,
      signature,
    },
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

/* ------------------------------------------------------------------
   Private files (job application CVs)
   Uploaded server-side as resource_type "raw" with type "authenticated",
   so they are never publicly readable. Staff get a short-lived signed
   download link. Credentials never leave the server.
   ------------------------------------------------------------------ */

export const PRIVATE_CV_FOLDER = `${UPLOAD_ROOT_FOLDER}/applications`;
export const CV_LINK_TTL_SECONDS = 10 * 60;

function apiBase(resourceType: "raw") {
  return `https://api.cloudinary.com/v1_1/${getEnv().CLOUDINARY_CLOUD_NAME}/${resourceType}`;
}

/** Signed body for a Cloudinary admin/upload call: params + api_key + signature. */
function signedFields(params: Record<string, string | number>) {
  const env = getEnv();
  const signature = signParams(params, env.CLOUDINARY_API_SECRET);
  return {
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    api_key: env.CLOUDINARY_API_KEY,
    signature,
  };
}

/**
 * Uploads a private file. `publicId` is random and includes the extension
 * (raw files keep it). Returns the stored public ID.
 */
export async function uploadPrivateRaw(options: {
  bytes: Uint8Array;
  filename: string;
  mime: string;
  publicId: string;
}): Promise<{ publicId: string; bytes: number }> {
  const fields = signedFields({
    folder: PRIVATE_CV_FOLDER,
    public_id: options.publicId,
    timestamp: Math.floor(Date.now() / 1000),
    type: "authenticated",
  });
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  form.append("file", new Blob([new Uint8Array(options.bytes)], { type: options.mime }), options.filename);

  const response = await fetch(`${apiBase("raw")}/upload`, { method: "POST", body: form });
  const body = (await response.json().catch(() => ({}))) as { public_id?: string; bytes?: number; error?: { message?: string } };
  if (!response.ok || !body.public_id) {
    throw new Error(`Cloudinary private upload failed (${response.status}): ${body.error?.message ?? "no public_id"}`);
  }
  return { publicId: body.public_id, bytes: body.bytes ?? options.bytes.length };
}

/**
 * Short-lived signed download link for a private raw file (Cloudinary's
 * private download API). Valid for CV_LINK_TTL_SECONDS. Never store or
 * expose it publicly.
 */
export function privateRawDownloadUrl(publicId: string, ttlSeconds = CV_LINK_TTL_SECONDS): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const fields = signedFields({
    attachment: "true",
    expires_at: timestamp + ttlSeconds,
    public_id: publicId,
    timestamp,
    type: "authenticated",
  });
  return `${apiBase("raw")}/download?${new URLSearchParams(fields).toString()}`;
}

/** Deletes a private raw file. Resolves even if it was already gone. */
export async function destroyPrivateRaw(publicId: string): Promise<void> {
  const fields = signedFields({
    invalidate: "true",
    public_id: publicId,
    timestamp: Math.floor(Date.now() / 1000),
    type: "authenticated",
  });
  const response = await fetch(`${apiBase("raw")}/destroy`, { method: "POST", body: new URLSearchParams(fields) });
  const body = (await response.json().catch(() => ({}))) as { result?: string; error?: { message?: string } };
  if (!response.ok || (body.result !== "ok" && body.result !== "not found")) {
    throw new Error(`Cloudinary delete failed (${response.status}): ${body.error?.message ?? body.result ?? "unknown"}`);
  }
}
