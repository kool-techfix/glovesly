import { getClientIp, getUserAgent, parseJson } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth/cookies";
import { loginSchema } from "@/Schemas/auth.schema";
import { authService } from "@/Services/auth.service";

export async function POST(request: Request) {
  return handle(async () => {
    const input = await parseJson(request, loginSchema);
    const result = await authService.login(input, {
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    await setSessionCookie(result.token, { expiresAt: result.expiresAt, persistent: result.persistent });
    return ok(result.user);
  });
}
