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
          <div className="reveal">
            <h2 id="careers-intro-title" className="display careers-section-title">
              {intro.title}
            </h2>
            <div className="prose-body prose-measure mt-8">
              {intro.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="careers-photo reveal reveal-delay-1">
            {intro.image ? (
              <CloudinaryImage src={intro.image.src} alt={intro.image.alt} fill sizes="(max-width: 900px) 100vw, 45vw" className="object-cover" />
            ) : (
              <span className="media-fallback careers-photo-fallback" aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      {/* C. People behind the projects */}
      <section id={life.id} className="section-pad section-band scroll-anchor" aria-labelledby="careers-life-title">
        <div className="container-wide">
          <h2 id="careers-life-title" className="display careers-section-title reveal">
            {life.title}
          </h2>
          <ul className="careers-gallery mt-10">
            {life.gallery.map((tile, index) => (
              <li key={tile.caption} className={`careers-gallery-item reveal reveal-delay-${Math.min(index, 3)}`}>
                <figure className="careers-tile">
                  {tile.image ? (
                    <CloudinaryImage src={tile.image.src} alt={tile.image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  ) : null}
                  <figcaption className={tile.image ? "careers-tile-caption" : "careers-tile-caption is-solid"}>{tile.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* D. Opportunities */}
      <section id={opportunities.id} className="section-pad scroll-anchor careers-opportunities" aria-labelledby="careers-opportunities-title">
        <div className="container-wide">
          <h2 id="careers-opportunities-title" className="display careers-section-title careers-section-title--lead">
            {opportunities.title}
          </h2>
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
            <h2 id="careers-business-title" className="display careers-section-title reveal">
              {business.title}
            </h2>
            <ul className="careers-business mt-10">
              {services.map((service) => (
                <li key={service.id}>
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
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* F. Closing band */}
      <section className="cta-band careers-closing" aria-labelledby="careers-closing-title">
        <div className="container-wide cta-band-inner">
          <div>
            <h2 id="careers-closing-title" className="display cta-band-title">
              {closing.title}
            </h2>
            <p className="cta-band-text">{closing.text}</p>
          </div>
          <ButtonLink href={closing.cta.href} testId="link-careers-submit-cv">
            {closing.cta.label}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
