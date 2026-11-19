import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { newsCreateSchema } from "@/Schemas/news.schema";
import { newsService } from "@/Services/news.service";

export const { GET, POST } = adminCollectionRoutes(newsService, newsCreateSchema);
