import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { serviceCreateSchema } from "@/Schemas/service.schema";
import { serviceService } from "@/Services/service.service";

export const { GET, POST } = adminCollectionRoutes(serviceService, serviceCreateSchema);
