import type { Metadata } from "next";

import { ProjectsList } from "@/components/public/projects-list";
import { CtaBand, EmptyNote } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { pageIntros } from "@/data/content";
import { projectService } from "@/Services/project.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description: pageIntros.projects.description,
};

export default async function ProjectsPage() {
  const projects = await projectService.listPublished();
  return (
    <>
      <PageHero eyebrow={pageIntros.projects.eyebrow} title={pageIntros.projects.title} description={pageIntros.projects.description} />
      <section className="section-pad">
        <div className="container-wide">
          <h2 className="sr-only">All projects</h2>
          {projects.length ? <ProjectsList projects={projects} /> : <EmptyNote>Projects will appear here once they are published.</EmptyNote>}
        </div>
      </section>
      <CtaBand area="projects" />
    </>
  );
}
