import { adminItemRoutes } from "@/lib/api/content-routes";
import { serviceUpdateSchema } from "@/Schemas/service.schema";
import { serviceService } from "@/Services/service.service";

export const { GET, PATCH, DELETE } = adminItemRoutes(serviceService, serviceUpdateSchema);
