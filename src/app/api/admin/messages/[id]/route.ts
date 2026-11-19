import { parseJson, parseParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { idParamsSchema } from "@/Schemas/common.schema";
import { messageUpdateSchema } from "@/Schemas/contact.schema";
import { contactService } from "@/Services/contact.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    await requireEditor();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await contactService.get(id));
  });
}

/** { status?, replyDraft? } */
export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireEditor();
    const { id } = parseParams(await context.params, idParamsSchema);
    const input = await parseJson(request, messageUpdateSchema);
    return ok(await contactService.update(id, input, actor));
  });
}

export async function DELETE(_request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireEditor();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await contactService.remove(id, actor));
  });
}
