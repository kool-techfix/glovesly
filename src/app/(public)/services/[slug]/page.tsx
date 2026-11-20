import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCard } from "@/components/public/cards";
import { Paragraphs } from "@/components/public/prose";
import { ClosingBand } from "@/components/public/sections";
import { CapabilityList } from "@/components/public/service-parts";
import { Eyebrow, PageHero, SectionHeading } from "@/components/site";
import { servicesClosing } from "@/data/content";
import { excerpt, toParagraphs } from "@/lib/display";
import { projectService } from "@/Services/project.service";
import { serviceService, type ServiceDto } from "@/Services/service.service";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await serviceService.listPublished()).map((service) => ({ slug: service.slug }));
}

/** Summary, else body, else the capability list (Energy Solutions has no copy yet). */
function describe(service: ServiceDto): string {
  return excerpt(service.summary || service.body) || `${service.title}: ${service.capabilities.join(", ")}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await serviceService.getPublishedBySlug((await params).slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: describe(service),
    openGraph: service.imageUrl ? { images: [service.imageUrl] } : undefined,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, services] = await Promise.all([serviceService.getPublishedBySlug(slug), serviceService.listPublished()]);
  if (!service) notFound();

  const related = service.sector ? await projectService.listPublishedBySector(service.sector, 3) : [];
  const position = services.findIndex((item) => item.id === service.id);
  const previous = position > 0 ? services[position - 1] : undefined;
  const next = position >= 0 && position < services.length - 1 ? services[position + 1] : undefined;
  const hasBody = toParagraphs(service.body).length > 0;

  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={service.title}
        description={service.summary || undefined}
        tone="accent"
        image={service.imageUrl ? { src: service.imageUrl, alt: "" } : null}
      >
        <Link href="/services" className="link-arrow focus-ring" data-testid="link-service-back">
          <ArrowLeft aria-hidden="true" size={16} /> All services
        </Link>
      </PageHero>

      {hasBody ? (
        <section className="section-pad" aria-label={`About ${service.title}`}>
          <div className="container-wide detail-grid">
            <Paragraphs text={service.body} className="prose-measure reveal" />
            {service.capabilities.length ? (
              <aside className="detail-aside reveal reveal-delay-1" aria-labelledby="service-capabilities">
                <h2 id="service-capabilities" className="display detail-aside-title">
                  Capabilities
                </h2>
                <ul className="check-list mt-5">
                  {service.capabilities.map((capability) => (
                    <li key={capability}>
                      <Check aria-hidden="true" size={18} />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </section>
      ) : service.capabilities.length ? (
        // No body copy yet: show the capabilities on their own, with no filler text.
        <section className="section-pad" aria-labelledby="service-capabilities">
          <div className="container-wide reveal">
            <SectionHeading title={<span id="service-capabilities">Capabilities</span>} />
            <CapabilityList items={service.capabilities} label={`${service.title} capabilities`} className="mt-8 capability-list--wide" />
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="section-pad section-band" aria-labelledby="service-related">
          <div className="container-wide">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Our work" title={<span id="service-related">Related projects</span>} />
              <Link href="/projects" className="link-arrow focus-ring" data-testid="link-service-all-projects">
                All projects <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
            <ul className="card-grid mt-12">
              {related.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {previous || next ? (
        <nav className="service-pager" aria-label="More services">
          <div className="container-wide service-pager-inner">
            {previous ? (
              <Link href={`/services/${previous.slug}`} className="service-pager-link focus-ring" rel="prev" data-testid="link-service-previous">
                <Eyebrow as="p">
                  <ArrowLeft aria-hidden="true" size={14} /> Previous service
                </Eyebrow>
                <span className="display service-pager-title">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/services/${next.slug}`} className="service-pager-link is-next focus-ring" rel="next" data-testid="link-service-next">
                <Eyebrow as="p">
                  Next service <ArrowRight aria-hidden="true" size={14} />
                </Eyebrow>
                <span className="display service-pager-title">{next.title}</span>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}

      <ClosingBand
        id="service-closing-title"
        content={servicesClosing}
        primaryTestId="link-service-contact"
        secondaryTestId="link-service-projects"
      />
    </>
  );
}
