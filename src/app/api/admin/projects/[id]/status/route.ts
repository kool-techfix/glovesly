import { adminStatusRoute } from "@/lib/api/content-routes";
import { projectService } from "@/Services/project.service";

export const { POST } = adminStatusRoute(projectService);
