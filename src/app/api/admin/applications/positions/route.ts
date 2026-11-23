import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { jobApplicationService } from "@/Services/job-application.service";

/** Vacancies that have applications, for the inbox filter. */
export async function GET() {
  return handle(async () => {
    await requireEditor();
    return ok(await jobApplicationService.listPositions());
  });
}
