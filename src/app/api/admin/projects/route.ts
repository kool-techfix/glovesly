import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { projectCreateSchema } from "@/Schemas/project.schema";
import { projectService } from "@/Services/project.service";

export const { GET, POST } = adminCollectionRoutes(projectService, projectCreateSchema);
