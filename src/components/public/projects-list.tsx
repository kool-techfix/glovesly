"use client";

import { useState } from "react";

import { ProjectCard } from "@/components/public/cards";
import { PROJECT_SECTOR_LABELS, PROJECT_SECTORS, type ProjectSector } from "@/lib/domain";
import type { ProjectDto } from "@/Services/project.service";

/** Published projects with a sector filter (client-side; the list is already loaded). */
export function ProjectsList({ projects }: { projects: ProjectDto[] }) {
  const [sector, setSector] = useState<ProjectSector | "ALL">("ALL");
  const visible = sector === "ALL" ? projects : projects.filter((project) => project.sector === sector);
  const filters = [
    { value: "ALL" as const, label: "All sectors", count: projects.length },
    ...PROJECT_SECTORS.map((value) => ({
      value,
      label: PROJECT_SECTOR_LABELS[value],
      count: projects.filter((project) => project.sector === value).length,
    })),
  ];

  return (
    <div>
      <div className="filter-row" role="group" aria-label="Filter projects by sector">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className="filter-pill focus-ring"
            aria-pressed={sector === filter.value}
            onClick={() => setSector(filter.value)}
            data-testid={`button-projects-filter-${filter.value.toLowerCase()}`}
          >
            {filter.label}
            <span className="filter-count">{filter.count}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>
      {visible.length ? (
        <ul className="card-grid mt-10">
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-note mt-10">No published projects in this sector yet.</p>
      )}
    </div>
  );
}
