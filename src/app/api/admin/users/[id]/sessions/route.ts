import { parseParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { idParamsSchema } from "@/Schemas/common.schema";
import { userService } from "@/Services/user.service";

/** "Sign out everywhere". */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const actor = await requireAdmin();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await userService.signOutEverywhere(id, actor));
  });
}
