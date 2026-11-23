import type { MetadataRoute } from "next";

import { getEnv } from "@/lib/env";
import { newsService } from "@/Services/news.service";
import { projectService } from "@/Services/project.service";
import { serviceService } from "@/Services/service.service";
import { vacancyService } from "@/Services/vacancy.service";

export const revalidate = 3600;

const STATIC_PATHS = ["/", "/about", "/services", "/projects", "/news", "/our-team", "/careers", "/careers/apply", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getEnv().APP_URL;
  const [services, projects, news, vacancies] = await Promise.all([
    serviceService.listPublished(),
    projectService.listPublished(),
    newsService.listPublished(),
    vacancyService.listOpen(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${base}${path === "/" ? "" : path}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...services.map((item) => ({ url: `${base}/services/${item.slug}`, lastModified: item.updatedAt, priority: 0.7 })),
    ...projects.map((item) => ({ url: `${base}/projects/${item.slug}`, lastModified: item.updatedAt, priority: 0.7 })),
    ...news.map((item) => ({ url: `${base}/news/${item.slug}`, lastModified: item.updatedAt, priority: 0.6 })),
    ...vacancies.map((item) => ({ url: `${base}/careers/${item.slug}`, lastModified: item.publishedAt ?? undefined, priority: 0.7 })),
  ];
}
