import { publicSlugRoute } from "@/lib/api/content-routes";
import { serviceService } from "@/Services/service.service";

export const { GET } = publicSlugRoute(serviceService);
