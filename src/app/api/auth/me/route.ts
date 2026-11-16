import { handle, ok } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth-guard";
import { authService } from "@/Services/auth.service";

export async function GET() {
  return handle(async () => {
    const actor = await requireAuth();
    return ok(await authService.me(actor));
  });
}
