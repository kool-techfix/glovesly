import type { Metadata } from "next";

import { ApplicationForm } from "@/components/careers/application-form";
import { PageHero } from "@/components/site";
import { careersPage } from "@/data/content";
import { GENERAL_APPLICATION_LABEL } from "@/lib/careers/application-form";
import { serviceService } from "@/Services/service.service";

export const revalidate = 600;

export const metadata: Metadata = {
  title: careersPage.apply.meta.title,
  description: careersPage.apply.meta.description,
  alternates: { canonical: "/careers/apply" },
  openGraph: {
    title: `${careersPage.apply.meta.title} · Glovesly Pro-Project`,
    description: careersPage.apply.meta.description,
    url: "/careers/apply",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default async function GeneralApplicationPage() {
  const services = await serviceService.listPublished();
  const areas = [...services.map((service) => service.title), "Other"];
  const { apply } = careersPage;

  return (
    <>
      <PageHero
        variant="compact"
        breadcrumbs={[{ label: "Careers", href: "/careers" }, { label: apply.title }]}
        eyebrow={apply.eyebrow}
        title={apply.title}
        description={apply.intro}
      />
      <section className="section-pad" aria-label="Application form">
        <div className="container-narrow">
          <ApplicationForm
            positionLabel={GENERAL_APPLICATION_LABEL}
            areasOfInterest={areas}
            consentText={careersPage.form.consent}
            successTitle={careersPage.form.successTitle}
          />
        </div>
      </section>
    </>
  );
}
