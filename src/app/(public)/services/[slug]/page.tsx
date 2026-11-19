import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaImage } from "@/components/public/media-image";
import { Paragraphs } from "@/components/public/prose";
import { CtaBand } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { excerpt } from "@/lib/display";
import { serviceService } from "@/Services/service.service";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await serviceService.listPublished()).map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await serviceService.getPublishedBySlug((await params).slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: excerpt(service.summary || service.body),
    openGraph: service.imageUrl ? { images: [service.imageUrl] } : undefined,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await serviceService.getPublishedBySlug((await params).slug);
  if (!service) notFound();

  return (
    <>
      <PageHero eyebrow="Service" title={service.title} description={service.summary || undefined}>
        <Link href="/services" className="link-arrow focus-ring" data-testid="link-service-back">
          ← All services
        </Link>
      </PageHero>
      <section className="section-pad">
        <div className="container-wide detail-grid">
          <div>
            <MediaImage
              src={service.imageUrl}
              alt=""
              label={service.title.charAt(0)}
              sizes="(max-width: 960px) 100vw, 60vw"
              priority
              className="aspect-[16/9] rounded-[var(--radius)]"
            />
            <Paragraphs text={service.body} className="mt-10" />
          </div>
          {service.capabilities.length ? (
            <aside className="detail-aside" aria-labelledby="service-capabilities">
              <h2 id="service-capabilities" className="display text-xl">
                Capabilities
              </h2>
              <ul className="check-list mt-5">
                {service.capabilities.map((capability) => (
                  <li key={capability}>
                    <Check aria-hidden="true" size={18} />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </section>
      <CtaBand area="service" />
    </>
  );
}
