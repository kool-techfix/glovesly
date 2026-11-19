import { parseJson } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin, requireEditor } from "@/lib/auth/auth-guard";
import { settingsUpdateSchema } from "@/Schemas/settings.schema";
import { settingsService } from "@/Services/settings.service";

/** Editors can read the settings (read-only screen). */
export async function GET() {
  return handle(async () => {
    await requireEditor();
    return ok(await settingsService.get());
  });
}

/** Only admins can change them. */
export async function PATCH(request: Request) {
  return handle(async () => {
    const actor = await requireAdmin();
    const input = await parseJson(request, settingsUpdateSchema);
    return ok(await settingsService.update(input, actor));
  });
}
