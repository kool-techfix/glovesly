import { publicListRoute } from "@/lib/api/content-routes";
import { serviceService } from "@/Services/service.service";

export const { GET } = publicListRoute(serviceService);
