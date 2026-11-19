import { isNigeriaState } from "@/lib/nigeria-states";
import { projectRepository, type ProjectRecord } from "@/Repositories/project.repository";
import type { ProjectSector, ProjectStatus } from "@/Schemas/common.schema";
import {
  createContentService,
  mediaProblem,
  problems,
  toContentDtoBase,
  type ContentDtoBase,
} from "@/Services/content.service";

export type ProjectDto = ContentDtoBase & {
  title: string;
  summary: string;
  body: string;
  sector: ProjectSector;
  client: string | null;
  locationLabel: string | null;
  state: string;
  latitude: number | null;
  longitude: number | null;
  year: number | null;
  projectStatus: ProjectStatus;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  galleryUrls: string[];
  galleryPublicIds: string[];
};

export function toProjectDto(record: ProjectRecord): ProjectDto {
  return {
    ...toContentDtoBase(record),
    title: record.title,
    summary: record.summary,
    body: record.body,
    sector: record.sector,
    client: record.client,
    locationLabel: record.locationLabel,
    state: record.state,
    latitude: record.latitude,
    longitude: record.longitude,
    year: record.year,
    projectStatus: record.projectStatus,
    coverImageUrl: record.coverImageUrl,
    coverImagePublicId: record.coverImagePublicId,
    galleryUrls: record.galleryUrls,
    galleryPublicIds: record.galleryPublicIds,
  };
}

export const projectService = createContentService({
  module: "projects",
  entityType: "project",
  label: "Project",
  repository: projectRepository,
  toDto: toProjectDto,
  titleOf: (record) => record.title,
  slugSource: (input) => input.title,
  publishProblems: (record) =>
    problems(
      mediaProblem(record.coverImageUrl, "A cover image"),
      // Both columns are NOT NULL; these guard against rows written outside the API.
      !record.sector && "Choose a sector before publishing.",
      !isNigeriaState(record.state) && "Choose a state (one of the 36 states or the FCT) before publishing.",
      (record.latitude === null) !== (record.longitude === null) &&
        "Set both latitude and longitude, or leave both empty.",
    ),
});
