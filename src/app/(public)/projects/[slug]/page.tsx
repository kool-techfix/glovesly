import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaImage } from "@/components/public/media-image";
import { Paragraphs } from "@/components/public/prose";
import { CtaBand } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { excerpt, projectStatusLabel, sectorLabel, toParagraphs } from "@/lib/display";
import { cn } from "@/lib/utils";
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
    // No summary or body yet: describe it from the stored facts only.
    description:
      excerpt(project.summary || project.body) ||
      [project.title, sectorLabel(project.sector), project.locationLabel || project.state, project.client]
        .filter(Boolean)
        .join(". ") + ".",
    openGraph: project.coverImageUrl ? { images: [project.coverImageUrl] } : undefined,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await projectService.getPublishedBySlug((await params).slug);
  if (!project) notFound();

  // Only facts that are set; Year stays hidden until the owner adds it.
  const facts = (
    [
      ["Client", project.client],
      ["Location", project.locationLabel || project.state],
      ["Sector", sectorLabel(project.sector)],
      ["Status", projectStatusLabel(project.projectStatus)],
      ["Year", project.year],
    ] as Array<[string, string | number | null]>
  ).filter(([, value]) => value !== null && value !== "");
  const hasBody = toParagraphs(project.body).length > 0;

  const factList = (
    <dl className={cn("fact-list", hasBody ? "mt-5" : "fact-list--row mt-5")}>
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <>
      {/* No cover yet: a flat accent hero (the same fallback as the cards). */}
      <PageHero
        eyebrow={sectorLabel(project.sector)}
        title={project.title}
        description={project.summary || undefined}
        tone="accent"
        image={project.coverImageUrl ? { src: project.coverImageUrl, alt: "" } : null}
      >
        <Link href="/projects" className="link-arrow focus-ring" data-testid="link-project-back">
          <ArrowLeft aria-hidden="true" size={16} /> All projects
        </Link>
      </PageHero>
      <section className="section-pad">
        {hasBody ? (
          <div className="container-wide detail-grid">
            <Paragraphs text={project.body} />
            <aside className="detail-aside" aria-labelledby="project-facts">
              <h2 id="project-facts" className="display detail-aside-title">
                Project details
              </h2>
              {factList}
            </aside>
          </div>
        ) : (
          <div className="container-wide">
            <section className="detail-aside detail-aside--wide" aria-labelledby="project-facts">
              <h2 id="project-facts" className="display detail-aside-title">
                Project details
              </h2>
              {factList}
            </section>
          </div>
        )}
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
                    className="aspect-[4/3]"
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
