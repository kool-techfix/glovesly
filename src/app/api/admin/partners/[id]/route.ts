import { adminItemRoutes } from "@/lib/api/content-routes";
import { partnerUpdateSchema } from "@/Schemas/partner.schema";
import { partnerService } from "@/Services/partner.service";

export const { GET, PATCH, DELETE } = adminItemRoutes(partnerService, partnerUpdateSchema);
