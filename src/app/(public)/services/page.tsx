import type { Metadata } from "next";

import { ServiceCard } from "@/components/public/cards";
import { CtaBand, EmptyNote } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { pageIntros } from "@/data/content";
import { serviceService } from "@/Services/service.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Services",
  description: pageIntros.services.description,
};

export default async function ServicesPage() {
  const services = await serviceService.listPublished();
  return (
    <>
      <PageHero eyebrow={pageIntros.services.eyebrow} title={pageIntros.services.title} description={pageIntros.services.description} />
      <section className="section-pad">
        <div className="container-wide">
          <h2 className="sr-only">All services</h2>
          {services.length ? (
            <ul className="card-grid">
              {services.map((service) => (
                <li key={service.id}>
                  <ServiceCard service={service} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>Services will appear here once they are published.</EmptyNote>
          )}
        </div>
      </section>
      <CtaBand area="services" />
    </>
  );
}
