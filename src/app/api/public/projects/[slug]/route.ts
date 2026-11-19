import { publicSlugRoute } from "@/lib/api/content-routes";
import { projectService } from "@/Services/project.service";

export const { GET } = publicSlugRoute(projectService);
