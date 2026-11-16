import { handle, ok } from "@/lib/api/response";
import { clearSessionCookie, readSessionCookie } from "@/lib/auth/cookies";
import { authService } from "@/Services/auth.service";

export async function POST() {
  return handle(async () => {
    await authService.logout(await readSessionCookie());
    await clearSessionCookie();
    return ok({ signedOut: true });
  });
}
