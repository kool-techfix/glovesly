import type { Metadata } from "next";
import Link from "next/link";

import { ProjectCard } from "@/components/public/cards";
import { CtaBand, EmptyNote } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { pageIntros } from "@/data/content";
import { PROJECT_SECTORS, type ProjectSector } from "@/lib/domain";
import { projectService } from "@/Services/project.service";

/*
 * No ISR here: reading searchParams (?sector=) makes the page render per
 * request. The project list itself still comes from the cached service
 * (projects tag), so this costs no extra database queries.
 */

export const metadata: Metadata = {
  title: "Projects",
  description: pageIntros.projects.description,
};

/** Filter labels and their ?sector= values. */
const SECTOR_FILTERS: Record<ProjectSector, { label: string; param: string }> = {
  AVIATION: { label: "Aviation", param: "aviation" },
  CONSTRUCTION: { label: "Construction", param: "construction" },
  SECURITY: { label: "Security solutions", param: "security" },
  ENERGY: { label: "Energy solutions", param: "energy" },
};

function sectorFromParam(value: string | string[] | undefined): ProjectSector | null {
  const param = Array.isArray(value) ? value[0] : value;
  return PROJECT_SECTORS.find((sector) => SECTOR_FILTERS[sector].param === param) ?? null;
}

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function ProjectsPage({ searchParams }: Props) {
  const projects = await projectService.listPublished();
  const sector = sectorFromParam((await searchParams).sector);
  const visible = sector ? projects.filter((project) => project.sector === sector) : projects;

  // Only sectors with at least one published project get a link.
  const filters = [
    { key: "all", label: "All", href: "/projects", count: projects.length, current: sector === null },
    ...PROJECT_SECTORS.map((value) => ({
      key: SECTOR_FILTERS[value].param,
      label: SECTOR_FILTERS[value].label,
      href: `/projects?sector=${SECTOR_FILTERS[value].param}`,
      count: projects.filter((project) => project.sector === value).length,
      current: sector === value,
    })).filter((filter) => filter.count > 0),
  ];

  return (
    <>
      <PageHero eyebrow={pageIntros.projects.eyebrow} title={pageIntros.projects.title} description={pageIntros.projects.description} />
      <section className="section-pad">
        <div className="container-wide">
          <h2 className="sr-only">{sector ? `${SECTOR_FILTERS[sector].label} projects` : "All projects"}</h2>
          {projects.length ? (
            <>
              {filters.length > 2 ? (
                <nav aria-label="Filter projects by sector">
                  <ul className="filter-row">
                    {filters.map((filter) => (
                      <li key={filter.key}>
                        <Link
                          href={filter.href}
                          scroll={false}
                          className="filter-button focus-ring"
                          aria-current={filter.current ? "page" : undefined}
                          data-testid={`link-projects-filter-${filter.key}`}
                        >
                          {filter.label}
                          <span className="filter-count">
                            <span className="sr-only">(</span>
                            {filter.count}
                            <span className="sr-only">{filter.count === 1 ? " project)" : " projects)"}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
              {visible.length ? (
                <ul className="card-grid mt-10">
                  {visible.map((project) => (
                    <li key={project.id}>
                      <ProjectCard project={project} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyNote className="mt-10">No published projects in this sector yet.</EmptyNote>
              )}
            </>
          ) : (
            <EmptyNote>Projects will appear here once they are published.</EmptyNote>
          )}
        </div>
      </section>
      <CtaBand area="projects" />
    </>
  );
}
