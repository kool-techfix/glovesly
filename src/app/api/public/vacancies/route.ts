import { handle, ok } from "@/lib/api/response";
import { vacancyService } from "@/Services/vacancy.service";

/** Open vacancies: PUBLISHED and not past their deadline (end of day, Lagos). */
export async function GET() {
  return handle(async () => ok(await vacancyService.listOpen()));
}
