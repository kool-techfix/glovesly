import { getClientIp, parseJson } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { passwordTokenSchema } from "@/Schemas/auth.schema";
import { passwordService } from "@/Services/password.service";

export async function POST(request: Request) {
  return handle(async () => {
    const { token } = await parseJson(request, passwordTokenSchema);
    return ok(await passwordService.checkLink(token, getClientIp(request)));
  });
}
