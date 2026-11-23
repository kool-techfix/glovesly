import { adminItemRoutes } from "@/lib/api/content-routes";
import { vacancyUpdateSchema } from "@/Schemas/vacancy.schema";
import { vacancyService } from "@/Services/vacancy.service";

export const { GET, PATCH, DELETE } = adminItemRoutes(vacancyService, vacancyUpdateSchema);
