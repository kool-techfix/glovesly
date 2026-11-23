import { adminStatusRoute } from "@/lib/api/content-routes";
import { vacancyService } from "@/Services/vacancy.service";

export const { POST } = adminStatusRoute(vacancyService);
