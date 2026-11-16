import { parseParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { idParamsSchema } from "@/Schemas/common.schema";
import { userService } from "@/Services/user.service";

/** Emails an invite link (no password yet) or a reset link. */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const actor = await requireAdmin();
    const { id } = parseParams(await context.params, idParamsSchema);
    return ok(await userService.sendPasswordLink(id, actor), { status: 202 });
  });
}
