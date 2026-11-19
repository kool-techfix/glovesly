import type { Metadata } from "next";

import { HeroCarousel } from "@/components/hero-carousel";
import { CeoTeaser } from "@/components/public/ceo-message";
import { NewsCard, ProjectCard, ServiceCard } from "@/components/public/cards";
import { NigeriaMapSection } from "@/components/public/nigeria-map-section";
import { PartnersSection } from "@/components/public/partners-section";
import { CtaBand, EmptyNote, ListSection } from "@/components/public/sections";
import { ButtonLink, SectionHeading } from "@/components/site";
import { companySummary, heroSlides, home, sectors, showCeoTeaserOnHome, type HeroSlide } from "@/data/content";
import { newsService } from "@/Services/news.service";
import { partnerService } from "@/Services/partner.service";
import { projectService } from "@/Services/project.service";
import { serviceService, type ServiceDto } from "@/Services/service.service";
import { settingsService } from "@/Services/settings.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Glovesly Pro-Project" },
  description: companySummary,
};

/**
 * Point each slide's `/services/<slug>` CTA at the service page only when that
 * service is published; otherwise fall back to the services list, so the hero
 * never links to a 404 while the real services are still being written.
 */
function resolveHeroSlides(slides: HeroSlide[], services: ServiceDto[]): HeroSlide[] {
  const published = new Set(services.map((service) => `/services/${service.slug}`));
  return slides.map((slide) =>
    slide.primaryCta.href.startsWith("/services/") && !published.has(slide.primaryCta.href)
      ? { ...slide, primaryCta: { ...slide.primaryCta, href: "/services" } }
      : slide,
  );
}

export default async function HomePage() {
  const [services, projects, projectsByState, partners, news, settings] = await Promise.all([
    serviceService.listPublished(),
    projectService.listPublished(),
    projectService.listPublishedByState(),
    partnerService.listPublished(),
    newsService.listPublished(),
    settingsService.getPublic(),
  ]);

  return (
    <>
      <HeroCarousel slides={resolveHeroSlides(heroSlides, services)} label="Glovesly Pro-Project highlights" />

      <section className="section-pad" aria-labelledby="home-sectors">
        <div className="container-wide">
          <div id="home-sectors">
            <SectionHeading eyebrow={home.sectors.eyebrow} title={home.sectors.title} description={home.sectors.description} />
          </div>
          <ul className="sector-grid mt-12">
            {sectors.map((sector, index) => (
              <li key={sector.key} className="sector-card">
                <span className="sector-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="card-title mt-6">{sector.title}</h3>
                <p className="card-text mt-3">{sector.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {showCeoTeaserOnHome ? <CeoTeaser /> : null}

      <ListSection
        band
        eyebrow={home.services.eyebrow}
        title={home.services.title}
        description={home.services.description}
        action={
          <ButtonLink href="/services" variant="secondary" testId="link-home-services-all">
            All services
          </ButtonLink>
        }
      >
        {services.length ? (
          <ul className="card-grid">
            {services.slice(0, 6).map((service) => (
              <li key={service.id}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote>Services will appear here once they are published.</EmptyNote>
        )}
      </ListSection>

      <ListSection
        eyebrow={home.projects.eyebrow}
        title={home.projects.title}
        description={home.projects.description}
        action={
          <ButtonLink href="/projects" variant="secondary" testId="link-home-projects-all">
            All projects
          </ButtonLink>
        }
      >
        {projects.length ? (
          <ul className="card-grid">
            {projects.slice(0, 3).map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote>Projects will appear here once they are published.</EmptyNote>
        )}
      </ListSection>

      <NigeriaMapSection projectsByState={projectsByState} settings={settings} />

      <PartnersSection partners={partners} />

      {news.length ? (
        <ListSection
          eyebrow={home.news.eyebrow}
          title={home.news.title}
          action={
            <ButtonLink href="/news" variant="secondary" testId="link-home-news-all">
              All news
            </ButtonLink>
          }
        >
          <ul className="card-grid">
            {news.slice(0, 3).map((post) => (
              <li key={post.id}>
                <NewsCard post={post} />
              </li>
            ))}
          </ul>
        </ListSection>
      ) : null}

      <CtaBand area="home" />
    </>
  );
}
