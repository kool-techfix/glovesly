import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { teamCreateSchema } from "@/Schemas/team.schema";
import { teamService } from "@/Services/team.service";

export const { GET, POST } = adminCollectionRoutes(teamService, teamCreateSchema);
