import type { Metadata } from "next";

import { NewsCard, ProjectCard, ServiceCard } from "@/components/public/cards";
import { NigeriaMapSection } from "@/components/public/nigeria-map-section";
import { PartnersSection } from "@/components/public/partners-section";
import { CtaBand, EmptyNote, ListSection } from "@/components/public/sections";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/site";
import { companySummary, home, sectors } from "@/data/content";
import { newsService } from "@/Services/news.service";
import { partnerService } from "@/Services/partner.service";
import { projectService } from "@/Services/project.service";
import { serviceService } from "@/Services/service.service";
import { settingsService } from "@/Services/settings.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Glovesly Pro-Project" },
  description: companySummary,
};

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
      <section className="home-hero">
        <div className="container-wide relative z-10">
          <Eyebrow className="reveal">{home.hero.eyebrow}</Eyebrow>
          <h1 className="display home-hero-title reveal reveal-delay-1">{home.hero.title}</h1>
          <p className="lede home-hero-text reveal reveal-delay-2">{home.hero.description}</p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-3">
            <ButtonLink href={home.hero.primaryCta.href} testId="link-home-hero-services">
              {home.hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={home.hero.secondaryCta.href} variant="secondary" testId="link-home-hero-contact">
              {home.hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </section>

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
