import type { Metadata } from "next";
import { CloudinaryImage as Image } from "@/components/cloudinary-image";

import { CeoMessageSection } from "@/components/public/ceo-message";
import { ClosingBand } from "@/components/public/sections";
import { Eyebrow, PageHero } from "@/components/site";
import { aboutMetaDescription, aboutPage } from "@/data/content";
import { cn } from "@/lib/utils";

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
          <div className="reveal">
            <Eyebrow as="h2" id="about-who-title">
              {sections.whoWeAre}
            </Eyebrow>
            <dl className="about-fact">
              <dt>Founded</dt>
              <dd className="display">{aboutPage.founded}</dd>
            </dl>
          </div>
          <div className="prose-body prose-measure reveal reveal-delay-1">
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
            <div className="prose-body prose-measure mt-6">
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
          <div className={cn("mt-10", portfolioImage && "about-split about-split--media")}>
            <div className="prose-body prose-measure reveal reveal-delay-2">
              <p>{paragraphs[2]}</p>
            </div>
            {portfolioImage ? (
              <div className="about-photo about-photo--square reveal reveal-delay-2">
                <Image src={portfolioImage.src} alt={portfolioImage.alt} fill sizes="(max-width: 860px) 100vw, 45vw" loading="lazy" />
              </div>
            ) : null}
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

      <ClosingBand id="about-closing-title" content={closing} primaryTestId="link-about-contact" secondaryTestId="link-about-team-closing" />
    </>
  );
}
