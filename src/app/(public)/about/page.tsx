import type { Metadata } from "next";
import Image from "next/image";

import { CeoMessageSection } from "@/components/public/ceo-message";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";
import { aboutMetaDescription, aboutPage } from "@/data/content";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: aboutPage.meta.title,
  description: aboutMetaDescription,
};

export default function AboutPage() {
  const { hero, sections, paragraphs, portfolio, vision, mission, closing, howWeWorkImage } = aboutPage;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} tone="accent" image={hero.image}>
        <ButtonLink href={hero.cta.href} testId="link-about-team">
          {hero.cta.label}
        </ButtonLink>
      </PageHero>

      {/* Who we are */}
      <section className="section-pad" aria-labelledby="about-who-title">
        <div className="container-wide about-split">
          <div className="reveal">
            <Eyebrow as="h2" id="about-who-title">
              {sections.whoWeAre}
            </Eyebrow>
            <dl className="about-fact">
              <dt>Founded</dt>
              <dd className="display">{aboutPage.founded}</dd>
            </dl>
          </div>
          <div className="prose-body about-prose reveal reveal-delay-1">
            <p>{paragraphs[0]}</p>
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="section-pad section-band" aria-labelledby="about-how-title">
        <div className={cn("container-wide", howWeWorkImage && "about-split about-split--media")}>
          <div className="reveal">
            <Eyebrow as="h2" id="about-how-title">
              {sections.howWeWork}
            </Eyebrow>
            <div className="prose-body about-prose mt-6">
              <p>{paragraphs[1]}</p>
            </div>
          </div>
          {howWeWorkImage ? (
            <div className="about-photo reveal reveal-delay-1">
              <Image src={howWeWorkImage.src} alt={howWeWorkImage.alt} fill sizes="(max-width: 860px) 100vw, 45vw" loading="lazy" />
            </div>
          ) : null}
        </div>
      </section>

      {/* What we deliver */}
      <section className="section-pad" aria-labelledby="about-deliver-title">
        <div className="container-wide">
          <Eyebrow as="h2" id="about-deliver-title" className="reveal">
            {sections.whatWeDeliver}
          </Eyebrow>
          <ul className="about-portfolio reveal reveal-delay-1" aria-label="Our portfolio">
            {portfolio.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="prose-body about-prose mt-10 reveal reveal-delay-2">
            <p>{paragraphs[2]}</p>
          </div>
        </div>
      </section>

      {/* Vision and mission */}
      <section className="section-pad section-band" aria-label="Vision and mission">
        <div className="container-wide about-statements">
          <article className="editorial-card reveal">
            <h2 className="display editorial-card-title">{vision.title}</h2>
            <p className="editorial-card-text">{vision.text}</p>
          </article>
          <article className="editorial-card reveal reveal-delay-1">
            <h2 className="display editorial-card-title">{mission.title}</h2>
            <p className="display about-pull-quote">{mission.text}</p>
          </article>
        </div>
      </section>

      <CeoMessageSection band={false} />

      {/* Closing band */}
      <section className="about-closing" aria-labelledby="about-closing-title">
        <div className="container-wide about-closing-inner">
          <h2 id="about-closing-title" className="display about-closing-title">
            {closing.title}
          </h2>
          <div className="about-closing-actions">
            <ButtonLink href={closing.primaryCta.href} testId="link-about-contact">
              {closing.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={closing.secondaryCta.href} variant="secondary" onDark testId="link-about-team-closing">
              {closing.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
