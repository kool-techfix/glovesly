import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { partnerCreateSchema } from "@/Schemas/partner.schema";
import { partnerService } from "@/Services/partner.service";

export const { GET, POST } = adminCollectionRoutes(partnerService, partnerCreateSchema);
