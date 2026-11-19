import { getClientIp, parseJson } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { contactSubmitSchema } from "@/Schemas/contact.schema";
import { contactService } from "@/Services/contact.service";

/** Public contact form. Always 202 on valid input (honeypot hits included). */
export async function POST(request: Request) {
  return handle(async () => {
    const input = await parseJson(request, contactSubmitSchema);
    await contactService.submit(input, getClientIp(request));
    return ok({ received: true }, { status: 202 });
  });
}
