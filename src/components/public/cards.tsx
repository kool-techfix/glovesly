import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/public/media-image";
import { sectorLabel } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { ProjectDto } from "@/Services/project.service";
import type { ServiceDto } from "@/Services/service.service";

/* Hook-free cards for public lists. Each card is one link with a clear name. */

export function ServiceCard({ service }: { service: ServiceDto }) {
  return (
    <article className="card group">
      <MediaImage src={service.imageUrl} alt="" label={service.title.charAt(0)} sizes="(max-width: 720px) 100vw, 33vw" className="aspect-4/3" />
      <div className="card-body">
        <h3 className="card-title">
          <Link href={`/services/${service.slug}`} className="card-link focus-ring" data-testid={`link-services-card-${service.slug}`}>
            {service.title}
          </Link>
        </h3>
        {service.summary ? <p className="card-text">{service.summary}</p> : null}
        <span className="card-more" aria-hidden="true">
          Learn more <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
}

/**
 * A project's cover, or a flat navy block with the sector label while the
 * project has no photo. Decorative: the title and sector are in the card text.
 */
export function ProjectCover({ project, sizes, className }: { project: ProjectDto; sizes: string; className?: string }) {
  if (project.coverImageUrl) {
    return <MediaImage src={project.coverImageUrl} alt="" sizes={sizes} className={className} />;
  }
  return (
    <div className={cn("media-frame media-fallback", className)} aria-hidden="true">
      <span>{sectorLabel(project.sector)}</span>
    </div>
  );
}

export function ProjectCard({ project }: { project: ProjectDto }) {
  const location = project.locationLabel || project.state;
  return (
    <article className="card group">
      <ProjectCover project={project} sizes="(max-width: 720px) 100vw, 33vw" className="aspect-4/3" />
      <div className="card-body">
        <p className="card-kicker">{sectorLabel(project.sector)}</p>
        <h3 className="card-title">
          <Link href={`/projects/${project.slug}`} className="card-link focus-ring" data-testid={`link-projects-card-${project.slug}`}>
            {project.title}
          </Link>
        </h3>
        <p className="card-meta">
          {project.client ? (
            <>
              <span>
                <span className="sr-only">Client: </span>
                {project.client}
              </span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" size={14} />
            <span className="sr-only">Location: </span>
            {location}
          </span>
        </p>
        {project.summary ? <p className="card-text">{project.summary}</p> : null}
      </div>
    </article>
  );
}

