import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CloudinaryImage } from "@/components/cloudinary-image";
import { VacancyBoard, VacancyBoardStatic } from "@/components/careers/vacancy-board";
import { ButtonLink, PageHero } from "@/components/site";
import { careersPage } from "@/data/content";
import { excerpt } from "@/lib/display";
import { serviceService } from "@/Services/service.service";
import { vacancyService } from "@/Services/vacancy.service";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 600;

export const metadata: Metadata = {
  title: careersPage.meta.title,
  description: careersPage.meta.description,
  alternates: { canonical: "/careers" },
  openGraph: { title: `${careersPage.meta.title} · Glovesly Pro-Project`, description: careersPage.meta.description, url: "/careers", type: "website" },
  robots: { index: true, follow: true },
};

/** First sentence of a service summary (owner copy), for the "Find your place" cards. */
function firstSentence(text: string) {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : excerpt(text)).trim();
}

export default async function CareersPage() {
  const [vacancies, services] = await Promise.all([vacancyService.listOpen(), serviceService.listPublished()]);
  const { hero, intro, life, opportunities, business, closing } = careersPage;
  const boardCopy = { empty: opportunities.empty, noMatches: opportunities.noMatches, submitCv: opportunities.submitCv };

  return (
    <div className="careers-page">
      {/* A. Hero */}
      <PageHero
        variant="photo"
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.text}
        image={hero.image}
        actions={[
          { label: hero.primaryCta.label, href: hero.primaryCta.href, testId: "link-careers-explore" },
          { label: hero.secondaryCta.label, href: hero.secondaryCta.href, variant: "secondary", testId: "link-careers-culture" },
        ]}
      />

      {/* B. More than a workplace */}
      <section className="section-pad" aria-labelledby="careers-intro-title">
        <div className="container-wide careers-split">
          <ScrollReveal >
            <h2 id="careers-intro-title" className="display careers-section-title">
              {intro.title}
            </h2>
            <div className="prose-body prose-measure mt-8">
              {intro.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal className="careers-photo" delay={0.1}>
            {intro.image ? (
              <CloudinaryImage src={intro.image.src} alt={intro.image.alt} fill sizes="(max-width: 900px) 100vw, 45vw" className="object-cover" />
            ) : (
              <span className="media-fallback careers-photo-fallback" aria-hidden="true" />
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* C. People behind the projects */}
      <section id={life.id} className="section-pad section-band scroll-anchor" aria-labelledby="careers-life-title">
        <div className="container-wide">
          <ScrollReveal as="h2" id="careers-life-title" className="display careers-section-title">
            {life.title}
          </ScrollReveal>
          <StaggerContainer as="ul" className="careers-gallery mt-10">
            {life.gallery.map((tile) => (
              <StaggerItem as="li" key={tile.caption} className="careers-gallery-item">
                <figure className="careers-tile">
                  {tile.image ? (
                    <CloudinaryImage src={tile.image.src} alt={tile.image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  ) : null}
                  <figcaption className={tile.image ? "careers-tile-caption" : "careers-tile-caption is-solid"}>{tile.caption}</figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* D. Opportunities */}
      <section id={opportunities.id} className="section-pad scroll-anchor careers-opportunities" aria-labelledby="careers-opportunities-title">
        <div className="container-wide">
          <ScrollReveal as="h2" id="careers-opportunities-title" className="display careers-section-title careers-section-title--lead">
            {opportunities.title}
          </ScrollReveal>
          <div className="mt-10">
            <Suspense fallback={<VacancyBoardStatic vacancies={vacancies} copy={boardCopy} />}>
              <VacancyBoard vacancies={vacancies} copy={boardCopy} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* E. Find your place in our business */}
      {services.length ? (
        <section className="section-pad section-band" aria-labelledby="careers-business-title">
          <div className="container-wide">
            <ScrollReveal as="h2" id="careers-business-title" className="display careers-section-title">
              {business.title}
            </ScrollReveal>
            <StaggerContainer as="ul" className="careers-business mt-10">
              {services.map((service) => (
                <StaggerItem as="li" key={service.id}>
                  <article className="business-card">
                    <div className="business-card-media">
                      {service.imageUrl ? (
                        <CloudinaryImage src={service.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                      ) : (
                        <span className="media-fallback business-card-fallback" aria-hidden="true">
                          <span>{service.title}</span>
                        </span>
                      )}
                    </div>
                    <div className="business-card-body">
                      <h3 className="business-card-title">{service.title}</h3>
                      {service.summary ? <p className="business-card-text">{firstSentence(service.summary)}</p> : null}
                      <Link
                        href={`/careers?department=${encodeURIComponent(service.title)}#opportunities`}
                        className="business-card-link focus-ring"
                        data-testid={`link-careers-roles-${service.slug}`}
                      >
                        View open roles in {service.title} <ArrowRight aria-hidden="true" size={16} />
                      </Link>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ) : null}

      {/* F. Closing band */}
      <section className="cta-band careers-closing" aria-labelledby="careers-closing-title">
        <StaggerContainer className="container-wide cta-band-inner" stagger={0.15}>
          <StaggerItem>
            <h2 id="careers-closing-title" className="display cta-band-title">
              {closing.title}
            </h2>
            <p className="cta-band-text">{closing.text}</p>
          </StaggerItem>
          <StaggerItem>
            <ButtonLink href={closing.cta.href} testId="link-careers-submit-cv">
              {closing.cta.label}
            </ButtonLink>
          </StaggerItem>
        </StaggerContainer>
      </section>
    </div>
  );
}
