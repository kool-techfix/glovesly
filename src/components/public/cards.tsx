import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/public/media-image";
import { formatLongDate, sectorLabel } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { NewsPostDto } from "@/Services/news.service";
import type { ProjectDto } from "@/Services/project.service";
import type { ServiceDto } from "@/Services/service.service";

/* Hook-free cards for public lists. Each card is one link with a clear name. */

export function ServiceCard({ service }: { service: ServiceDto }) {
  return (
    <article className="card group">
      <MediaImage src={service.imageUrl} alt="" label={service.title.charAt(0)} sizes="(max-width: 720px) 100vw, 33vw" className="aspect-[4/3]" />
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
      <ProjectCover project={project} sizes="(max-width: 720px) 100vw, 33vw" className="aspect-[4/3]" />
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

/** The latest article, large, at the top of /news. Links to our own article page. */
export function FeaturedNewsCard({ post }: { post: NewsPostDto }) {
  return (
    <article className="card news-featured group" data-testid={`card-news-featured-${post.slug}`}>
      {post.coverImageUrl ? (
        <MediaImage src={post.coverImageUrl} alt="" sizes="(max-width: 900px) 100vw, 55vw" priority className="news-featured-media" />
      ) : (
        <div className="media-frame media-fallback news-featured-media" aria-hidden="true" />
      )}
      <div className="card-body news-featured-body">
        {post.publishedAt ? (
          <p className="card-kicker">
            <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
          </p>
        ) : null}
        <h3 className="display news-featured-title">
          <Link href={`/news/${post.slug}`} className="card-link focus-ring" data-testid={`link-news-featured-${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="card-text">{post.excerpt}</p> : null}
        {post.sourceName ? <p className="card-source">Source: {post.sourceName}</p> : null}
        <span className="card-more" aria-hidden="true">
          Read the article <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
}

/** Links to our own article page; the outlet is linked from inside the article. */
export function NewsCard({ post }: { post: NewsPostDto }) {
  return (
    <article className="card group">
      {post.coverImageUrl ? (
        <MediaImage src={post.coverImageUrl} alt="" sizes="(max-width: 720px) 100vw, 33vw" className="aspect-[16/10]" />
      ) : (
        <div className="media-frame media-fallback aspect-[16/10]" aria-hidden="true" />
      )}
      <div className="card-body">
        {post.publishedAt ? (
          <p className="card-kicker">
            <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
          </p>
        ) : null}
        <h3 className="card-title">
          <Link href={`/news/${post.slug}`} className="card-link focus-ring" data-testid={`link-news-card-${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="card-text">{post.excerpt}</p> : null}
        {post.sourceName ? <p className="card-source">Source: {post.sourceName}</p> : null}
      </div>
    </article>
  );
}
