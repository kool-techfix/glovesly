import { publicListRoute } from "@/lib/api/content-routes";
import { teamService } from "@/Services/team.service";

export const { GET } = publicListRoute(teamService);
