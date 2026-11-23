import type { Metadata } from "next";
import { CloudinaryImage as Image } from "@/components/cloudinary-image";

import { CeoMessageSection } from "@/components/public/ceo-message";
import { ClosingBand } from "@/components/public/sections";
import { Eyebrow, PageHero } from "@/components/site";
import { aboutMetaDescription, aboutPage } from "@/data/content";
import { cn } from "@/lib/utils";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: aboutPage.meta.title,
  description: aboutMetaDescription,
};

export default function AboutPage() {
  const { hero, sections, paragraphs, portfolio, vision, mission, closing, howWeWorkImage, portfolioImage } = aboutPage;

  return (
    <>
      <PageHero
        variant="photo"
        eyebrow={hero.eyebrow}
        title={hero.title}
        image={hero.image}
        actions={[{ label: hero.cta.label, href: hero.cta.href, testId: "link-about-team" }]}
        facts={[
          { label: "Founded", value: aboutPage.founded },
          { label: "Business lines", value: aboutPage.businessLines },
        ]}
      />

      {/* Who we are */}
      <section className="section-pad" aria-labelledby="about-who-title">
        <div className="container-wide about-split">
          <ScrollReveal >
            <Eyebrow as="h2" id="about-who-title">
              {sections.whoWeAre}
            </Eyebrow>
            <dl className="about-fact">
              <dt>Founded</dt>
              <dd className="display">{aboutPage.founded}</dd>
            </dl>
          </ScrollReveal>
          <ScrollReveal className="prose-body prose-measure" delay={0.1}>
            <p>{paragraphs[0]}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* How we work */}
      <section className="section-pad section-band" aria-labelledby="about-how-title">
        <div className={cn("container-wide", howWeWorkImage && "about-split about-split--media")}>
          <ScrollReveal >
            <Eyebrow as="h2" id="about-how-title">
              {sections.howWeWork}
            </Eyebrow>
            <div className="prose-body prose-measure mt-6">
              <p>{paragraphs[1]}</p>
            </div>
          </ScrollReveal>
          {howWeWorkImage ? (
            <ScrollReveal className="about-photo" delay={0.1}>
              <Image src={howWeWorkImage.src} alt={howWeWorkImage.alt} fill sizes="(max-width: 860px) 100vw, 45vw" loading="lazy" />
            </ScrollReveal>
          ) : null}
        </div>
      </section>

      {/* What we deliver */}
      <section className="section-pad" aria-labelledby="about-deliver-title">
        <div className="container-wide">
          <ScrollReveal>
            <Eyebrow as="h2" id="about-deliver-title">
              {sections.whatWeDeliver}
            </Eyebrow>
          </ScrollReveal>
          <StaggerContainer as="ul" className="about-portfolio" aria-label="Our portfolio" stagger={0.08}>
            {portfolio.map((item) => (
              <StaggerItem as="li" key={item}>{item}</StaggerItem>
            ))}
          </StaggerContainer>
          <div className={cn("mt-10", portfolioImage && "about-split about-split--media")}>
            <ScrollReveal className="prose-body prose-measure" delay={0.2}>
              <p>{paragraphs[2]}</p>
            </ScrollReveal>
            {portfolioImage ? (
              <ScrollReveal className="about-photo about-photo--square" delay={0.2}>
                <Image src={portfolioImage.src} alt={portfolioImage.alt} fill sizes="(max-width: 860px) 100vw, 45vw" loading="lazy" />
              </ScrollReveal>
            ) : null}
          </div>
        </div>
      </section>

      {/* Vision and mission */}
      <section className="section-pad section-band" aria-label="Vision and mission">
        <div className="container-wide about-statements">
          <ScrollReveal as="article" className="editorial-card">
            <h2 className="display editorial-card-title">{vision.title}</h2>
            <p className="editorial-card-text">{vision.text}</p>
          </ScrollReveal>
          <ScrollReveal as="article" className="editorial-card" delay={0.1}>
            <h2 className="display editorial-card-title">{mission.title}</h2>
            <p className="display about-pull-quote">{mission.text}</p>
          </ScrollReveal>
        </div>
      </section>

      <CeoMessageSection band={false} />

      <ClosingBand id="about-closing-title" content={closing} primaryTestId="link-about-contact" secondaryTestId="link-about-team-closing" />
    </>
  );
}
