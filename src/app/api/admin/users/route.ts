import { parseJson, parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { userCreateSchema, userListQuerySchema } from "@/Schemas/user.schema";
import { userService } from "@/Services/user.service";

export async function GET(request: Request) {
  return handle(async () => {
    await requireAdmin();
    const { items, meta } = await userService.list(parseQuery(request, userListQuerySchema));
    return ok(items, { meta });
  });
}

/** Invite: creates the user without a password and emails an invite link. */
export async function POST(request: Request) {
  return handle(async () => {
    const actor = await requireAdmin();
    const input = await parseJson(request, userCreateSchema);
    return ok(await userService.invite(input, actor), { status: 201 });
  });
}
