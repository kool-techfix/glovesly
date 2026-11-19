import { adminItemRoutes } from "@/lib/api/content-routes";
import { teamUpdateSchema } from "@/Schemas/team.schema";
import { teamService } from "@/Services/team.service";

export const { GET, PATCH, DELETE } = adminItemRoutes(teamService, teamUpdateSchema);
