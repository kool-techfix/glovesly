import { ArrowUpRight, Building2 } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/public/contact-form";
import { PageHero } from "@/components/site";
import { contactForm, pageIntros } from "@/data/content";
import { directionsUrl } from "@/lib/display";
import { settingsService } from "@/Services/settings.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  // No page description supplied yet: the site default from the root layout is used.
};

export default async function ContactPage() {
  const settings = await settingsService.getPublic();

  // Every line comes from WorkspaceSettings; empty ones are hidden by PageHero.
  const facts = [
    {
      label: "Email",
      value: settings.contactEmail ? (
        <a href={`mailto:${settings.contactEmail}`} className="focus-ring" data-testid="link-contact-email">
          {settings.contactEmail}
        </a>
      ) : null,
    },
    {
      label: "Phone",
      value: settings.phone ? (
        <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="focus-ring" data-testid="link-contact-phone">
          {settings.phone}
        </a>
      ) : null,
    },
    {
      label: "Address",
      value: settings.address ? (
        <>
          <span className="whitespace-pre-line">{settings.address}</span>
          <br />
          <a
            href={directionsUrl(settings.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-directions focus-ring"
            data-testid="link-contact-directions"
          >
            Get directions
            <ArrowUpRight aria-hidden="true" size={16} />
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
        </>
      ) : null,
    },
  ];

  return (
    <>
      <PageHero variant="split" eyebrow={pageIntros.contact.eyebrow} title={pageIntros.contact.title} facts={facts}>
        <ContactForm title={contactForm.title} successMessage={contactForm.success} />
      </PageHero>

      <section className="after-contact-hero pb-16" aria-labelledby={settings.officeLocations.length ? "contact-offices" : undefined}>
        {settings.officeLocations.length ? (
          <div className="container-wide">
            <h2 id="contact-offices" className="display text-2xl">
              Offices
            </h2>
            <ul className="contact-list mt-5">
              {settings.officeLocations.map((office) => (
                <li key={`${office.name}-${office.state}`}>
                  <Building2 aria-hidden="true" size={18} />
                  <span>
                    <strong>{office.name}</strong>
                    {office.isHeadOffice ? " (head office)" : ""}
                    <br />
                    {office.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </>
  );
}
