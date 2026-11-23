import { ArrowDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/careers/application-form";
import { Paragraphs } from "@/components/public/prose";
import { PageHero } from "@/components/site";
import { careersPage } from "@/data/content";
import { excerpt, formatLongDate, toParagraphs } from "@/lib/display";
import { EMPLOYMENT_TYPE_LABELS, type EmploymentType } from "@/lib/domain";
import { getEnv } from "@/lib/env";
import { vacancyService, type PublicVacancyDto } from "@/Services/vacancy.service";

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await vacancyService.listOpen()).map((vacancy) => ({ slug: vacancy.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vacancy = await vacancyService.getOpenBySlug((await params).slug);
  if (!vacancy) return { title: "Vacancy not found", robots: { index: false } };
  const description = excerpt(vacancy.summary || vacancy.overview) || `${vacancy.title} at Glovesly Pro-Project.`;
  return {
    title: `${vacancy.title} (${vacancy.location})`,
    description,
    alternates: { canonical: `/careers/${vacancy.slug}` },
    openGraph: { title: `${vacancy.title} · Careers at Glovesly`, description, url: `/careers/${vacancy.slug}`, type: "website" },
    robots: { index: true, follow: true },
  };
}

/** schema.org JobPosting employmentType values. */
const SCHEMA_EMPLOYMENT: Record<EmploymentType, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  INTERNSHIP: "INTERN",
};

/** JobPosting built only from real fields; properties without a value are left out. */
function jobPostingJsonLd(vacancy: PublicVacancyDto) {
  const siteUrl = getEnv().APP_URL;
  const description = [vacancy.summary, ...toParagraphs(vacancy.overview)].filter(Boolean).join("\n\n");
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description,
    datePosted: vacancy.publishedAt ?? undefined,
    validThrough: vacancy.deadline ?? undefined,
    employmentType: vacancy.employmentType ? SCHEMA_EMPLOYMENT[vacancy.employmentType] : undefined,
    hiringOrganization: { "@type": "Organization", name: "Glovesly Pro-Project Limited", sameAs: siteUrl, url: siteUrl },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", ...(vacancy.location ? { addressLocality: vacancy.location } : {}), addressCountry: "NG" },
    },
    url: `${siteUrl}/careers/${vacancy.slug}`,
  };
  for (const key of Object.keys(data)) if (data[key] === undefined || data[key] === "") delete data[key];
  // "<" escaped so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function VacancyPage({ params }: Props) {
  const vacancy = await vacancyService.getOpenBySlug((await params).slug);
  if (!vacancy) notFound();

  const type = vacancy.employmentType ? EMPLOYMENT_TYPE_LABELS[vacancy.employmentType] : null;
  const deadline = vacancy.deadline ? formatLongDate(vacancy.deadline) : null;
  const facts = [
    { label: "Location", value: vacancy.location },
    { label: "Employment type", value: type },
    { label: "Deadline", value: deadline ? `Apply by ${deadline}` : null },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jobPostingJsonLd(vacancy) }} />
      <PageHero
        variant="article"
        breadcrumbs={[{ label: "Careers", href: "/careers" }, { label: vacancy.title }]}
        eyebrow={vacancy.department || undefined}
        title={vacancy.title}
        facts={facts}
      />

      <section className="section-pad" aria-label="About this role">
        <div className="container-wide vacancy-layout">
          <div className="vacancy-content">
            {toParagraphs(vacancy.overview).length ? (
              <section aria-labelledby="vacancy-overview">
                <h2 id="vacancy-overview" className="display vacancy-heading">
                  Overview
                </h2>
                <Paragraphs text={vacancy.overview} className="prose-measure mt-5" />
              </section>
            ) : null}
            {vacancy.responsibilities.length ? (
              <section aria-labelledby="vacancy-responsibilities">
                <h2 id="vacancy-responsibilities" className="display vacancy-heading">
                  Responsibilities
                </h2>
                <ul className="vacancy-list-items">
                  {vacancy.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {vacancy.requirements.length ? (
              <section aria-labelledby="vacancy-requirements">
                <h2 id="vacancy-requirements" className="display vacancy-heading">
                  Requirements
                </h2>
                <ul className="vacancy-list-items">
                  {vacancy.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section aria-labelledby="vacancy-how">
              <h2 id="vacancy-how" className="display vacancy-heading">
                How to apply
              </h2>
              <Paragraphs text={vacancy.applicationNote || careersPage.vacancy.howToApply} className="prose-measure mt-5" />
            </section>
          </div>

          <aside className="vacancy-summary" aria-labelledby="vacancy-summary-title">
            <h2 id="vacancy-summary-title" className="vacancy-summary-title">
              Role summary
            </h2>
            <dl className="vacancy-summary-facts">
              {vacancy.department ? (
                <div>
                  <dt>Department</dt>
                  <dd>{vacancy.department}</dd>
                </div>
              ) : null}
              {facts
                .filter((fact) => fact.value)
                .map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
            </dl>
            <a href="#apply" className="button-primary focus-ring vacancy-summary-apply" data-testid="link-vacancy-apply-now">
              <span>Apply now</span>
              <ArrowDown aria-hidden="true" className="button-icon" />
            </a>
          </aside>
        </div>
      </section>

      <section id="apply" className="section-pad section-band scroll-anchor" aria-labelledby="vacancy-apply-title">
        <div className="container-narrow">
          <h2 id="vacancy-apply-title" className="display careers-section-title">
            Apply for this role
          </h2>
          <div className="mt-8">
            <ApplicationForm
              positionLabel={vacancy.title}
              vacancyId={vacancy.id}
              consentText={careersPage.form.consent}
              successTitle={careersPage.form.successTitle}
            />
          </div>
        </div>
      </section>
    </>
  );
}
