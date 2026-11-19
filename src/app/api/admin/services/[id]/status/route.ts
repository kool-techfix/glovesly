import { adminStatusRoute } from "@/lib/api/content-routes";
import { serviceService } from "@/Services/service.service";

export const { POST } = adminStatusRoute(serviceService);
