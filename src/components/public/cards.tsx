import { ArrowRight, Linkedin, MapPin } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/public/media-image";
import { formatLongDate, initials, projectStatusLabel, sectorLabel } from "@/lib/display";
import type { NewsPostDto } from "@/Services/news.service";
import type { ProjectDto } from "@/Services/project.service";
import type { ServiceDto } from "@/Services/service.service";
import type { TeamMemberDto } from "@/Services/team.service";

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

export function ProjectCard({ project }: { project: ProjectDto }) {
  return (
    <article className="card group">
      <MediaImage src={project.coverImageUrl} alt="" label={project.title.charAt(0)} sizes="(max-width: 720px) 100vw, 33vw" className="aspect-[4/3]" />
      <div className="card-body">
        <p className="card-kicker">{sectorLabel(project.sector)}</p>
        <h3 className="card-title">
          <Link href={`/projects/${project.slug}`} className="card-link focus-ring" data-testid={`link-projects-card-${project.slug}`}>
            {project.title}
          </Link>
        </h3>
        <p className="card-meta">
          <MapPin aria-hidden="true" size={14} />
          {project.locationLabel ? `${project.locationLabel}, ${project.state}` : project.state}
          <span aria-hidden="true">·</span>
          {projectStatusLabel(project.projectStatus)}
        </p>
        {project.summary ? <p className="card-text">{project.summary}</p> : null}
      </div>
    </article>
  );
}

export function NewsCard({ post }: { post: NewsPostDto }) {
  return (
    <article className="card group">
      <MediaImage src={post.coverImageUrl} alt="" label={post.title.charAt(0)} sizes="(max-width: 720px) 100vw, 33vw" className="aspect-[16/10]" />
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
      </div>
    </article>
  );
}

export function TeamCard({ member }: { member: TeamMemberDto }) {
  return (
    <article className="team-card" data-testid={`card-team-${member.slug}`}>
      <MediaImage
        src={member.photoUrl}
        alt={member.photoUrl ? `Photo of ${member.name}` : ""}
        label={initials(member.name)}
        sizes="(max-width: 720px) 100vw, 25vw"
        className="aspect-[4/5]"
      />
      <div className="mt-4">
        <h3 className="card-title">{member.name}</h3>
        <p className="card-kicker mt-1">{member.role}</p>
        {member.bio ? (
          <details className="team-bio">
            <summary className="focus-ring" data-testid={`button-team-bio-${member.slug}`}>
              Read bio<span className="sr-only"> of {member.name}</span>
            </summary>
            <p className="card-text mt-2 whitespace-pre-line">{member.bio}</p>
          </details>
        ) : null}
        {member.linkedinUrl ? (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="team-social focus-ring"
            data-testid={`link-team-linkedin-${member.slug}`}
          >
            <Linkedin aria-hidden="true" size={16} />
            <span className="sr-only">{member.name} on LinkedIn (opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
