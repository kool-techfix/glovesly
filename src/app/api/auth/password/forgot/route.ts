import { getClientIp, parseJson } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { forgotPasswordSchema } from "@/Schemas/auth.schema";
import { passwordService } from "@/Services/password.service";

// Always answers the same way, whether or not the email has an account.
export async function POST(request: Request) {
  return handle(async () => {
    const { email } = await parseJson(request, forgotPasswordSchema);
    await passwordService.requestReset(email, getClientIp(request));
    return ok(
      { message: "If that email has an account, a reset link is on its way." },
      { status: 202 },
    );
  });
}
