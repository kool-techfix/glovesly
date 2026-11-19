import type { Metadata } from "next";

import { PartnerTile } from "@/components/public/cards";
import { CtaBand, ListSection } from "@/components/public/sections";
import { ButtonLink, PageHero, SectionHeading } from "@/components/site";
import { about } from "@/data/content";
import { partnerService } from "@/Services/partner.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description: about.hero.description,
};

export default async function AboutPage() {
  const partners = await partnerService.listPublished();

  return (
    <>
      <PageHero eyebrow={about.hero.eyebrow} title={about.hero.title} description={about.hero.description} />

      <section className="section-pad">
        <div className="container-wide about-story">
          <SectionHeading eyebrow={about.story.eyebrow} title={about.story.title} />
          <div className="prose-body">
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-band" aria-label="Mission and vision">
        <div className="container-wide grid gap-6 md:grid-cols-2">
          {about.missionVision.map((item) => (
            <div key={item.title} className="statement-card">
              <h2 className="display text-2xl">{item.title}</h2>
              <p className="lede mt-4">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <SectionHeading eyebrow={about.values.eyebrow} title={about.values.title} />
          <ul className="sector-grid mt-12">
            {about.values.items.map((value) => (
              <li key={value.title} className="sector-card">
                <h3 className="card-title">{value.title}</h3>
                <p className="card-text mt-3">{value.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad section-band">
        <div className="container-wide flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={about.team.eyebrow} title={about.team.title} description={about.team.description} />
          <ButtonLink href="/our-team" testId="link-about-team">
            Meet the team
          </ButtonLink>
        </div>
      </section>

      {partners.length ? (
        <ListSection eyebrow={about.partners.eyebrow} title={about.partners.title}>
          <ul className="partner-grid">
            {partners.map((partner) => (
              <li key={partner.id}>
                <PartnerTile partner={partner} />
              </li>
            ))}
          </ul>
        </ListSection>
      ) : null}

      <CtaBand area="about" />
    </>
  );
}
