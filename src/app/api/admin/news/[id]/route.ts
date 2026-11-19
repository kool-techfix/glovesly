import { adminItemRoutes } from "@/lib/api/content-routes";
import { newsUpdateSchema } from "@/Schemas/news.schema";
import { newsService } from "@/Services/news.service";

export const { GET, PATCH, DELETE } = adminItemRoutes(newsService, newsUpdateSchema);
