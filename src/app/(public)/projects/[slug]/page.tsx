import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaImage } from "@/components/public/media-image";
import { Paragraphs } from "@/components/public/prose";
import { CtaBand } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { excerpt, projectStatusLabel, sectorLabel } from "@/lib/display";
import { projectService } from "@/Services/project.service";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await projectService.listPublished()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await projectService.getPublishedBySlug((await params).slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: excerpt(project.summary || project.body),
    openGraph: project.coverImageUrl ? { images: [project.coverImageUrl] } : undefined,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await projectService.getPublishedBySlug((await params).slug);
  if (!project) notFound();

  const facts: Array<[string, string | number | null]> = [
    ["Sector", sectorLabel(project.sector)],
    ["State", project.state],
    ["Location", project.locationLabel],
    ["Client", project.client],
    ["Year", project.year],
    ["Status", projectStatusLabel(project.projectStatus)],
  ];

  return (
    <>
      <PageHero eyebrow={sectorLabel(project.sector)} title={project.title} description={project.summary || undefined}>
        <Link href="/projects" className="link-arrow focus-ring" data-testid="link-project-back">
          ← All projects
        </Link>
      </PageHero>
      <section className="section-pad">
        <div className="container-wide detail-grid">
          <div>
            <MediaImage
              src={project.coverImageUrl}
              alt=""
              label={project.title.charAt(0)}
              sizes="(max-width: 960px) 100vw, 60vw"
              priority
              className="aspect-[16/9] rounded-[var(--radius)]"
            />
            <Paragraphs text={project.body} className="mt-10" />
          </div>
          <aside className="detail-aside" aria-labelledby="project-facts">
            <h2 id="project-facts" className="display text-xl">
              Project details
            </h2>
            <dl className="fact-list mt-5">
              {facts
                .filter(([, value]) => value !== null && value !== "")
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
          </aside>
        </div>
        {project.galleryUrls.length ? (
          <div className="container-wide mt-16">
            <h2 className="display text-2xl">Gallery</h2>
            <ul className="gallery-grid mt-6">
              {project.galleryUrls.map((url, index) => (
                <li key={url}>
                  <MediaImage
                    src={url}
                    alt={`${project.title}, photo ${index + 1}`}
                    sizes="(max-width: 720px) 100vw, 33vw"
                    className="aspect-[4/3] rounded-[var(--radius)]"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
      <CtaBand area="project" />
    </>
  );
}
