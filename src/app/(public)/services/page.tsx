import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CapabilityList, ServiceMedia } from "@/components/public/service-parts";
import { ClosingBand, EmptyNote } from "@/components/public/sections";
import { Eyebrow, PageHero } from "@/components/site";
import { pageIntros, servicesClosing } from "@/data/content";
import { cn } from "@/lib/utils";
import { serviceService } from "@/Services/service.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Services",
  description: `${pageIntros.services.title} ${pageIntros.services.description}`,
};

const sectionNumber = (index: number) => String(index + 1).padStart(2, "0");

export default async function ServicesPage() {
  const services = await serviceService.listPublished();
  const intro = pageIntros.services;

  return (
    <>
      <PageHero
        variant="solid"
        tone="accent"
        eyebrow={intro.eyebrow}
        title={intro.title}
        description={intro.description}
        tabsLabel="Our services"
        tabs={services.map((service) => ({
          label: service.title,
          href: `#${service.slug}`,
          testId: `link-services-tab-${service.slug}`,
        }))}
      />

      {services.length ? (
        services.map((service, index) => {
          const titleId = `service-${service.slug}-title`;
          return (
            <section
              key={service.id}
              id={service.slug}
              className={cn("section-pad scroll-anchor", index % 2 === 1 && "section-band")}
              aria-labelledby={titleId}
            >
              <div className={cn("container-wide service-row", index % 2 === 1 && "is-reversed")}>
                <ServiceMedia
                  src={service.imageUrl}
                  sizes="(max-width: 900px) 100vw, 45vw"
                  preload={index === 0}
                  className="service-row-media reveal"
                />
                <div className="service-row-text reveal reveal-delay-1">
                  <Eyebrow>{sectionNumber(index)}</Eyebrow>
                  <h2 id={titleId} className="display service-row-title">
                    {service.title}
                  </h2>
                  {service.summary ? <p className="lede service-row-summary">{service.summary}</p> : null}
                  <CapabilityList items={service.capabilities} label={`${service.title} capabilities`} className="mt-8" />
                  <Link
                    href={`/services/${service.slug}`}
                    className="link-arrow focus-ring mt-8"
                    data-testid={`link-services-read-more-${service.slug}`}
                  >
                    Read more<span className="sr-only"> about {service.title}</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </div>
            </section>
          );
        })
      ) : (
        <section className="section-pad">
          <div className="container-wide">
            <EmptyNote>Services will appear here once they are published.</EmptyNote>
          </div>
        </section>
      )}

      <ClosingBand
        id="services-closing-title"
        content={servicesClosing}
        primaryTestId="link-services-contact"
        secondaryTestId="link-services-projects"
      />
    </>
  );
}
