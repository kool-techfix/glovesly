import { ApiError } from "@/lib/api/api-error";
import { parseParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { slugParamsSchema } from "@/Schemas/common.schema";
import { vacancyService } from "@/Services/vacancy.service";

type Context = { params: Promise<{ slug: string }> };

/** One open vacancy; 404 when unknown, unpublished or past its deadline. */
export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { slug } = parseParams(await context.params, slugParamsSchema);
    const vacancy = await vacancyService.getOpenBySlug(slug);
    if (!vacancy) throw ApiError.notFound("Vacancy not found.");
    return ok(vacancy);
  });
}
