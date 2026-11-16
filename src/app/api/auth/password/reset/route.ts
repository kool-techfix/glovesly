import { getClientIp, parseJson } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { resetPasswordSchema } from "@/Schemas/auth.schema";
import { passwordService } from "@/Services/password.service";

// Setting a password signs out every session, including this browser's.
export async function POST(request: Request) {
  return handle(async () => {
    const { token, password } = await parseJson(request, resetPasswordSchema);
    const result = await passwordService.resetPassword(token, password, getClientIp(request));
    await clearSessionCookie();
    return ok(result);
  });
}
