import type { UploadFolder, UploadResourceType } from "@/lib/domain";
import { api } from "@/lib/admin/api-client";

/*
 * Signed direct upload: ask the API for a signature, then POST the file
 * straight to Cloudinary. No file bytes go through this app.
 */

type Signature = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export type UploadedAsset = { url: string; publicId: string };

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function uploadToCloudinary(
  file: File,
  options: { folder: UploadFolder; resourceType?: UploadResourceType; onProgress?: (percent: number) => void },
): Promise<UploadedAsset> {
  const resourceType = options.resourceType ?? "image";
  if (resourceType === "image" && !file.type.startsWith("image/")) {
    throw new Error("Choose an image file (JPG, PNG, WebP or SVG).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("That file is larger than 10 MB. Resize it and try again.");
  }

  const signature = await api<Signature>("/api/admin/media/sign-upload", {
    method: "POST",
    body: { folder: options.folder, resourceType },
  });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("timestamp", String(signature.timestamp));
  form.append("folder", signature.folder);
  form.append("signature", signature.signature);

  // XMLHttpRequest rather than fetch so we can report upload progress.
  return new Promise<UploadedAsset>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", signature.uploadUrl);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("The upload failed. Check your connection and try again."));
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as {
          secure_url?: string;
          public_id?: string;
          error?: { message?: string };
        };
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url && body.public_id) {
          resolve({ url: body.secure_url, publicId: body.public_id });
        } else {
          reject(new Error(body.error?.message ?? `Cloudinary rejected the upload (${xhr.status}).`));
        }
      } catch {
        reject(new Error("Cloudinary returned an unexpected response."));
      }
    };
    xhr.send(form);
  });
}
