import type { Metadata } from "next";

import { ProjectCard } from "@/components/public/cards";
import { CtaBand, EmptyNote } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { pageIntros } from "@/data/content";
import { PROJECT_SECTORS, type ProjectSector } from "@/lib/domain";
import { projectService } from "@/Services/project.service";
import { StaggerContainer, StaggerItem } from "@/components/motion/reveal";

/*
 * No ISR here: reading searchParams (?sector=) makes the page render per
 * request. The project list itself still comes from the cached service
 * (projects tag), so this costs no extra database queries.
 */

export const metadata: Metadata = {
  title: "Projects",
  // No page description supplied yet: the site default from the root layout is used.
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

  // "6 completed projects"; if any are ongoing, just "8 projects".
  const allCompleted = projects.every((project) => project.projectStatus === "COMPLETED");
  const countLine = projects.length
    ? `${projects.length} ${allCompleted ? "completed " : ""}${projects.length === 1 ? "project" : "projects"}`
    : undefined;

  return (
    <>
      <PageHero
        variant="compact"
        eyebrow={pageIntros.projects.eyebrow}
        title={pageIntros.projects.title}
        description={countLine}
        tabsLabel="Filter projects by sector"
        tabs={
          filters.length > 2
            ? filters.map((filter) => ({
                label: filter.label,
                href: filter.href,
                active: filter.current,
                testId: `link-projects-filter-${filter.key}`,
              }))
            : undefined
        }
      />
      <section className="section-pad">
        <div className="container-wide">
          <h2 className="sr-only">{sector ? `${SECTOR_FILTERS[sector].label} projects` : "All projects"}</h2>
          {projects.length ? (
            visible.length ? (
              <StaggerContainer as="ul" className="card-grid">
                {visible.map((project) => (
                  <StaggerItem as="li" key={project.id}>
                    <ProjectCard project={project} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <EmptyNote>No published projects in this sector yet.</EmptyNote>
            )
          ) : (
            <EmptyNote>Projects will appear here once they are published.</EmptyNote>
          )}
        </div>
      </section>
      <CtaBand area="projects" />
    </>
  );
}
