import { parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { messageListQuerySchema } from "@/Schemas/contact.schema";
import { contactService } from "@/Services/contact.service";

export async function GET(request: Request) {
  return handle(async () => {
    await requireEditor();
    const { items, meta } = await contactService.list(parseQuery(request, messageListQuerySchema));
    return ok(items, { meta });
  });
}
