import { parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { applicationListQuerySchema } from "@/Schemas/job-application.schema";
import { jobApplicationService } from "@/Services/job-application.service";

/** ?status=&vacancyId=(id|general)&search=&page=&pageSize= */
export async function GET(request: Request) {
  return handle(async () => {
    await requireEditor();
    const { items, meta } = await jobApplicationService.list(parseQuery(request, applicationListQuerySchema));
    return ok(items, { meta });
  });
}
