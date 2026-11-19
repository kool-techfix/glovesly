import { Building2, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/public/contact-form";
import { PageHero } from "@/components/site";
import { contactForm, pageIntros } from "@/data/content";
import { settingsService } from "@/Services/settings.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description: pageIntros.contact.description,
};

export default async function ContactPage() {
  const settings = await settingsService.getPublic();

  return (
    <>
      <PageHero eyebrow={pageIntros.contact.eyebrow} title={pageIntros.contact.title} description={pageIntros.contact.description} />
      <section className="section-pad">
        <div className="container-wide contact-layout">
          <ContactForm title={contactForm.title} successMessage={contactForm.success} />

          <aside className="detail-aside" aria-labelledby="contact-details">
            <h2 id="contact-details" className="display text-xl">
              Contact details
            </h2>
            <ul className="contact-list mt-5">
              {settings.contactEmail ? (
                <li>
                  <Mail aria-hidden="true" size={18} />
                  <a href={`mailto:${settings.contactEmail}`} className="focus-ring" data-testid="link-contact-email">
                    {settings.contactEmail}
                  </a>
                </li>
              ) : null}
              {settings.phone ? (
                <li>
                  <Phone aria-hidden="true" size={18} />
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="focus-ring" data-testid="link-contact-phone">
                    {settings.phone}
                  </a>
                </li>
              ) : null}
              {settings.address ? (
                <li>
                  <MapPin aria-hidden="true" size={18} />
                  <span className="whitespace-pre-line">{settings.address}</span>
                </li>
              ) : null}
            </ul>

            {settings.officeLocations.length ? (
              <>
                <h3 className="display mt-10 text-lg">Offices</h3>
                <ul className="contact-list mt-4">
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
              </>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
