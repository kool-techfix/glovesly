import type { Metadata } from "next";
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

  // Empty facts are hidden by PageHero; Year only appears once it is set.
  const facts = [
    { label: "Client", value: project.client },
    { label: "Location", value: project.locationLabel || project.state },
    { label: "Sector", value: sectorLabel(project.sector) },
    { label: "Status", value: projectStatusLabel(project.projectStatus) },
    { label: "Year", value: project.year === null ? null : String(project.year) },
  ];
  const hasBody = toParagraphs(project.body).length > 0;
  const hasGallery = project.galleryUrls.length > 0;

  return (
    <>
      <PageHero
        variant="photo"
        breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.title }]}
        eyebrow={sectorLabel(project.sector)}
        title={project.title}
        description={project.summary || undefined}
        image={project.coverImageUrl ? { src: project.coverImageUrl, alt: "" } : null}
        facts={facts}
      />
      <section className={hasBody || hasGallery ? "section-pad" : "hero-after-spacer"}>
        {hasBody ? (
          <div className="container-wide">
            <Paragraphs text={project.body} className="prose-measure" />
          </div>
        ) : null}
        {project.galleryUrls.length ? (
          <div className={cn("container-wide", hasBody && "mt-16")}>
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
