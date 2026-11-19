import { serviceRepository, type ServiceRecord } from "@/Repositories/service.repository";
import {
  createContentService,
  mediaProblem,
  problems,
  toContentDtoBase,
  type ContentDtoBase,
} from "@/Services/content.service";

/** "Service" is the company's service lines (aviation, construction…), not a code service. */
export type ServiceDto = ContentDtoBase & {
  title: string;
  summary: string;
  body: string;
  capabilities: string[];
  imageUrl: string | null;
  imagePublicId: string | null;
};

export function toServiceDto(record: ServiceRecord): ServiceDto {
  return {
    ...toContentDtoBase(record),
    title: record.title,
    summary: record.summary,
    body: record.body,
    capabilities: record.capabilities,
    imageUrl: record.imageUrl,
    imagePublicId: record.imagePublicId,
  };
}

export const serviceService = createContentService({
  module: "services",
  entityType: "service",
  label: "Service",
  repository: serviceRepository,
  toDto: toServiceDto,
  titleOf: (record) => record.title,
  slugSource: (input) => input.title,
  publishProblems: (record) =>
    problems(
      mediaProblem(record.imageUrl, "An image"),
      record.capabilities.length === 0 && "Add at least one capability before publishing.",
    ),
});
