import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { summaryService } from "@/Services/summary.service";

export async function GET() {
  return handle(async () => {
    await requireEditor();
    return ok(await summaryService.get());
  });
}
