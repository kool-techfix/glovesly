import { isBeforeDeadline, toLagosDateInput } from "@/lib/lagos-date";
import { vacancyRepository, type VacancyRecord } from "@/Repositories/vacancy.repository";
import type { EmploymentType } from "@/Schemas/common.schema";
import type { VacancyCreateInput } from "@/Schemas/vacancy.schema";
import { createContentService, problems, toContentDtoBase, type ContentDtoBase } from "@/Services/content.service";

/*
 * Careers vacancies. A standard content module (DRAFT → REVIEW → PUBLISHED →
 * ARCHIVED; ARCHIVED means closed). Public reads also drop vacancies whose
 * deadline (end of day, Africa/Lagos) has passed. That check runs at request
 * time on top of the cached list, so a vacancy disappears when its deadline
 * passes without waiting for the cache.
 */

export type VacancyDto = ContentDtoBase & {
  title: string;
  department: string;
  employmentType: EmploymentType | null;
  location: string;
  summary: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  applicationNote: string | null;
  /** ISO end of the deadline day in Lagos, or null. */
  deadline: string | null;
  /** The deadline as "YYYY-MM-DD" (Lagos), for the admin date field. "" when none. */
  deadlineDate: string;
  /** Admin only: applications received. */
  applicationCount: number;
};

/** What the public site and API get: no admin-only fields. */
export type PublicVacancyDto = Omit<VacancyDto, "applicationCount" | "status" | "createdAt" | "updatedAt" | "deadlineDate" | "sortOrder">;

export function toVacancyDto(record: VacancyRecord): VacancyDto {
  return {
    ...toContentDtoBase(record),
    title: record.title,
    department: record.department,
    employmentType: record.employmentType,
    location: record.location,
    summary: record.summary,
    overview: record.overview,
    responsibilities: record.responsibilities,
    requirements: record.requirements,
    applicationNote: record.applicationNote,
    deadline: record.deadline?.toISOString() ?? null,
    deadlineDate: toLagosDateInput(record.deadline),
    applicationCount: record._count.applications,
  };
}

export function toPublicVacancy(dto: VacancyDto): PublicVacancyDto {
  return {
    id: dto.id,
    slug: dto.slug,
    publishedAt: dto.publishedAt,
    title: dto.title,
    department: dto.department,
    employmentType: dto.employmentType,
    location: dto.location,
    summary: dto.summary,
    overview: dto.overview,
    responsibilities: dto.responsibilities,
    requirements: dto.requirements,
    applicationNote: dto.applicationNote,
    deadline: dto.deadline,
  };
}

const base = createContentService({
  module: "vacancies",
  entityType: "vacancy",
  label: "Vacancy",
  repository: vacancyRepository,
  toDto: toVacancyDto,
  titleOf: (record) => record.title,
  slugSource: (input: VacancyCreateInput) => input.title,
  publishProblems: (record) =>
    problems(
      !record.title.trim() && "Add a title.",
      !record.department.trim() && "Add a department.",
      !record.employmentType && "Choose an employment type.",
      !record.location.trim() && "Add a location.",
      !record.summary.trim() && "Add a summary.",
      !record.overview.trim() && "Add an overview.",
      record.responsibilities.length === 0 && "Add at least one responsibility.",
      record.requirements.length === 0 && "Add at least one requirement.",
    ),
});

export const vacancyService = {
  ...base,

  /** Published and not past the deadline, in public order. */
  async listOpen(now: Date = new Date()): Promise<PublicVacancyDto[]> {
    return (await base.listPublished()).filter((vacancy) => isBeforeDeadline(vacancy.deadline, now)).map(toPublicVacancy);
  },

  /** One open vacancy by slug, or null (unknown, unpublished or expired). */
  async getOpenBySlug(slug: string, now: Date = new Date()): Promise<PublicVacancyDto | null> {
    const vacancy = await base.getPublishedBySlug(slug);
    return vacancy && isBeforeDeadline(vacancy.deadline, now) ? toPublicVacancy(vacancy) : null;
  },

  /** For an application: the vacancy if it is open, else null. Uncached. */
  async findOpenForApplication(id: string, now: Date = new Date()) {
    const record = await vacancyRepository.findOpenCandidate(id);
    return record && isBeforeDeadline(record.deadline, now) ? record : null;
  },

  /** Admin suggestions for the department field. */
  listDepartments() {
    return vacancyRepository.listDepartments();
  },
};
