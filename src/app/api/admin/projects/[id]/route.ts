import { adminItemRoutes } from "@/lib/api/content-routes";
import { projectUpdateSchema } from "@/Schemas/project.schema";
import { projectService } from "@/Services/project.service";

export const { GET, PATCH, DELETE } = adminItemRoutes(projectService, projectUpdateSchema);
