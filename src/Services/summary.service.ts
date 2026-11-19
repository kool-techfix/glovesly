import type { ContentModule } from "@/lib/cache";
import type { StatusCounts } from "@/Repositories/repository-utils";
import { contactService } from "@/Services/contact.service";
import { newsService } from "@/Services/news.service";
import { partnerService } from "@/Services/partner.service";
import { projectService } from "@/Services/project.service";
import { serviceService } from "@/Services/service.service";
import { teamService } from "@/Services/team.service";

export type AdminSummaryDto = {
  /** Status counts per content module. */
  modules: Record<ContentModule, StatusCounts>;
  /** Items waiting in REVIEW across every module. */
  reviewQueue: number;
  /** Contact messages still NEW. */
  unreadMessages: number;
};

const services = {
  services: serviceService,
  projects: projectService,
  news: newsService,
  team: teamService,
  partners: partnerService,
} satisfies Record<ContentModule, { countByStatus(): Promise<StatusCounts> }>;

/** Header badges and dashboard counts. */
export const summaryService = {
  async get(): Promise<AdminSummaryDto> {
    const keys = Object.keys(services) as ContentModule[];
    const [counts, unreadMessages] = await Promise.all([
      Promise.all(keys.map((key) => services[key].countByStatus())),
      contactService.countUnread(),
    ]);
    const modules = Object.fromEntries(keys.map((key, i) => [key, counts[i]])) as Record<
      ContentModule,
      StatusCounts
    >;
    const reviewQueue = counts.reduce((sum, c) => sum + c.REVIEW, 0);
    return { modules, reviewQueue, unreadMessages };
  },
};
