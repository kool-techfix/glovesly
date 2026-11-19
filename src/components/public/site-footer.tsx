import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/public/logo";
import { companySummary, footerNav, siteName } from "@/data/content";
import type { WorkspaceSettingsDto } from "@/Services/settings.service";

export function SiteFooter({ settings }: { settings: WorkspaceSettingsDto }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container-wide site-footer-grid">
        <div className="site-footer-brand">
          <Logo onDark testId="link-footer-logo" />
          <p className="site-footer-text">{companySummary}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="site-footer-heading">Explore</h2>
          <ul className="site-footer-links">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-footer-link focus-ring" data-testid={`link-footer-${item.key}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="site-footer-heading">Contact</h2>
          <ul className="site-footer-contact">
            {settings.contactEmail ? (
              <li>
                <Mail aria-hidden="true" size={16} />
                <a href={`mailto:${settings.contactEmail}`} className="site-footer-link focus-ring" data-testid="link-footer-email">
                  {settings.contactEmail}
                </a>
              </li>
            ) : null}
            {settings.phone ? (
              <li>
                <Phone aria-hidden="true" size={16} />
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="site-footer-link focus-ring" data-testid="link-footer-phone">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.address ? (
              <li>
                <MapPin aria-hidden="true" size={16} />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="container-wide site-footer-bottom">
        <p>
          © {year} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
