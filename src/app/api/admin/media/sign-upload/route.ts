import { parseJson } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { signUpload } from "@/lib/cloudinary";
import { signUploadSchema } from "@/Schemas/media.schema";

/** { folder, resourceType } → { uploadUrl, apiKey, timestamp, folder, signature }. */
export async function POST(request: Request) {
  return handle(async () => {
    await requireEditor();
    const input = await parseJson(request, signUploadSchema);
    return ok(signUpload(input));
  });
}
