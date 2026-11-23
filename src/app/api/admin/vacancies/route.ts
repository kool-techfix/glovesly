import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { vacancyCreateSchema } from "@/Schemas/vacancy.schema";
import { vacancyService } from "@/Services/vacancy.service";

export const { GET, POST } = adminCollectionRoutes(vacancyService, vacancyCreateSchema);
