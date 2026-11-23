import { parseJson, parseParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin, requireEditor } from "@/lib/auth/auth-guard";
import { idParamsSchema } from "@/Schemas/common.schema";
import { applicationUpdateSchema } from "@/Schemas/job-application.schema";
import { jobApplicationService } from "@/Services/job-application.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    await requireEditor();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await jobApplicationService.get(id));
  });
}

/** { status } only. EDITOR and ADMIN. */
export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireEditor();
    const { id } = parseParams(await context.params, idParamsSchema);
    const input = await parseJson(request, applicationUpdateSchema);
    return ok(await jobApplicationService.update(id, input, actor));
  });
}

/** ADMIN only. Deletes the CV from Cloudinary, then the row. */
export async function DELETE(_request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireAdmin();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await jobApplicationService.remove(id, actor));
  });
}
