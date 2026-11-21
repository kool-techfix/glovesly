import { cachedContent } from "@/lib/cache";
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

/** A published project as the Nigeria map needs it. */
export type ProjectMapEntry = {
  slug: string;
  title: string;
  sector: ProjectSector;
  client: string | null;
  locationLabel: string | null;
};

/** Published projects grouped by state (only states with at least one project). */
export type ProjectsByState = Record<string, ProjectMapEntry[]>;

const base = createContentService({
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

export const projectService = {
  ...base,

  /** Up to `limit` published projects in a sector, in sortOrder (related projects on a service page). */
  async listPublishedBySector(sector: ProjectSector, limit = 6): Promise<ProjectDto[]> {
    return (await base.listPublished()).filter((project) => project.sector === sector).slice(0, limit);
  },

  /**
   * Published projects grouped by state, for the Nigeria map. Cached under the
   * projects tag, so publishing, editing or unpublishing a project updates it.
   */
  listPublishedByState(): Promise<ProjectsByState> {
    return cachedContent("projects", ["by-state"], async () => {
      const grouped: ProjectsByState = {};
      for (const project of await projectRepository.listPublished()) {
        if (!isNigeriaState(project.state)) continue;
        (grouped[project.state] ??= []).push({
          slug: project.slug,
          title: project.title,
          sector: project.sector,
          client: project.client,
          locationLabel: project.locationLabel,
        });
      }
      return grouped;
    });
  },
};
