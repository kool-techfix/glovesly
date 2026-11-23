"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo } from "react";

import { VacancyCard } from "@/components/careers/vacancy-card";
import { ButtonLink } from "@/components/site";
import { EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES, type EmploymentType } from "@/lib/domain";
import type { PublicVacancyDto } from "@/Services/vacancy.service";
import { StaggerContainer, StaggerItem } from "@/components/motion/reveal";

/*
 * Vacancy list with department, type and location filters. The filters live
 * in the URL (?department=&type=&location=), so a filtered view can be shared
 * and the "View open roles in …" links can pre-filter it. The bar is hidden
 * with fewer than two vacancies.
 */

type Copy = { empty: string; noMatches: string; submitCv: { label: string; href: string } };

function distinct(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function VacancyBoard({ vacancies, copy }: { vacancies: PublicVacancyDto[]; copy: Copy }) {
  const params = useSearchParams();
  return <VacancyBoardView vacancies={vacancies} copy={copy} params={params} />;
}

/** Same board with no filters applied: the server render and the Suspense fallback. */
export function VacancyBoardStatic({ vacancies, copy }: { vacancies: PublicVacancyDto[]; copy: Copy }) {
  return <VacancyBoardView vacancies={vacancies} copy={copy} params={null} />;
}

function VacancyBoardView({
  vacancies,
  copy,
  params,
}: {
  vacancies: PublicVacancyDto[];
  copy: Copy;
  params: URLSearchParams | ReturnType<typeof useSearchParams> | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const baseId = useId();

  const department = params?.get("department") ?? "";
  const typeParam = params?.get("type") ?? "";
  const type = (EMPLOYMENT_TYPES as readonly string[]).includes(typeParam) ? (typeParam as EmploymentType) : "";
  const location = params?.get("location") ?? "";

  const options = useMemo(
    () => ({
      departments: distinct(vacancies.map((v) => v.department)),
      types: EMPLOYMENT_TYPES.filter((t) => vacancies.some((v) => v.employmentType === t)),
      locations: distinct(vacancies.map((v) => v.location)),
    }),
    [vacancies],
  );

  const visible = vacancies.filter(
    (v) => (!department || v.department === department) && (!type || v.employmentType === type) && (!location || v.location === location),
  );
  const filtering = Boolean(department || type || location);

  function update(next: { department?: string; type?: string; location?: string }) {
    const query = new URLSearchParams();
    const merged = { department, type, location, ...next };
    for (const [key, value] of Object.entries(merged)) if (value) query.set(key, value);
    const search = query.toString();
    router.replace(`${pathname}${search ? `?${search}` : ""}#opportunities`, { scroll: false });
  }
  const clear = () => router.replace(`${pathname}#opportunities`, { scroll: false });

  if (vacancies.length === 0) {
    return (
      <div className="vacancy-empty" data-testid="state-careers-empty">
        <p className="vacancy-empty-text">{copy.empty}</p>
        <ButtonLink href={copy.submitCv.href} testId="link-careers-submit-cv-empty">
          {copy.submitCv.label}
        </ButtonLink>
      </div>
    );
  }

  const countText = filtering
    ? `${visible.length} of ${vacancies.length} ${vacancies.length === 1 ? "role" : "roles"} shown`
    : `${vacancies.length} open ${vacancies.length === 1 ? "role" : "roles"}`;

  return (
    <div className="vacancy-board">
      {vacancies.length >= 2 ? (
        <form className="vacancy-filters" role="search" aria-label="Filter open roles" onSubmit={(event) => event.preventDefault()}>
          <div className="vacancy-filter">
            <label htmlFor={`${baseId}-department`} className="vacancy-filter-label">
              Department
            </label>
            <select
              id={`${baseId}-department`}
              className="vacancy-select focus-ring"
              value={department}
              onChange={(event) => update({ department: event.target.value })}
              data-testid="select-careers-department"
            >
              <option value="">All departments</option>
              {options.departments.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
              {department && !options.departments.includes(department) ? <option value={department}>{department}</option> : null}
            </select>
          </div>
          <div className="vacancy-filter">
            <label htmlFor={`${baseId}-type`} className="vacancy-filter-label">
              Employment type
            </label>
            <select
              id={`${baseId}-type`}
              className="vacancy-select focus-ring"
              value={type}
              onChange={(event) => update({ type: event.target.value })}
              data-testid="select-careers-type"
            >
              <option value="">All types</option>
              {options.types.map((value) => (
                <option key={value} value={value}>
                  {EMPLOYMENT_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="vacancy-filter">
            <label htmlFor={`${baseId}-location`} className="vacancy-filter-label">
              Location
            </label>
            <select
              id={`${baseId}-location`}
              className="vacancy-select focus-ring"
              value={location}
              onChange={(event) => update({ location: event.target.value })}
              data-testid="select-careers-location"
            >
              <option value="">All locations</option>
              {options.locations.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="vacancy-clear focus-ring" onClick={clear} disabled={!filtering} data-testid="button-careers-clear-filters">
            Clear filters
          </button>
        </form>
      ) : null}

      <p className="vacancy-count" role="status" aria-live="polite" data-testid="text-careers-count">
        {countText}
      </p>

      {visible.length ? (
        <StaggerContainer as="ul" className="vacancy-list">
          {visible.map((vacancy) => (
            <StaggerItem as="li" key={vacancy.id}>
              <VacancyCard vacancy={vacancy} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="vacancy-empty" data-testid="state-careers-no-matches">
          <p className="vacancy-empty-text">{copy.noMatches}</p>
          <div className="vacancy-empty-actions">
            <button type="button" className="button-secondary focus-ring" onClick={clear} data-testid="button-careers-clear-filters-empty">
              <span>Clear filters</span>
            </button>
            <ButtonLink href={copy.submitCv.href} variant="secondary" testId="link-careers-submit-cv-no-matches">
              {copy.submitCv.label}
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
