import { adminStatusRoute } from "@/lib/api/content-routes";
import { teamService } from "@/Services/team.service";

export const { POST } = adminStatusRoute(teamService);
