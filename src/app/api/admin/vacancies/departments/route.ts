import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { vacancyService } from "@/Services/vacancy.service";

/** Existing departments, for the admin form's suggestions. */
export async function GET() {
  return handle(async () => {
    await requireEditor();
    return ok(await vacancyService.listDepartments());
  });
}
