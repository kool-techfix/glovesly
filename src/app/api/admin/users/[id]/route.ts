import { parseJson, parseParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { idParamsSchema } from "@/Schemas/common.schema";
import { userUpdateSchema } from "@/Schemas/user.schema";
import { userService } from "@/Services/user.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    await requireAdmin();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await userService.get(id));
  });
}

export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireAdmin();
    const { id } = parseParams(await context.params, idParamsSchema);
    const input = await parseJson(request, userUpdateSchema);
    return ok(await userService.update(id, input, actor));
  });
}

export async function DELETE(_request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireAdmin();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await userService.remove(id, actor));
  });
}
