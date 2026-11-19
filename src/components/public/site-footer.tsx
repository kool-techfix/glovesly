import Link from "next/link";

import { Logo } from "@/components/public/logo";
import { companySummary, footerNav, siteName } from "@/data/content";
import { directionsUrl } from "@/lib/display";
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
          <dl className="site-footer-contact">
            {settings.phone ? (
              <div>
                <dt className="site-footer-label">Phone</dt>
                <dd>
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="site-footer-link focus-ring" data-testid="link-footer-phone">
                    {settings.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings.contactEmail ? (
              <div>
                <dt className="site-footer-label">Email</dt>
                <dd>
                  <a href={`mailto:${settings.contactEmail}`} className="site-footer-link focus-ring" data-testid="link-footer-email">
                    {settings.contactEmail}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings.address ? (
              <div>
                <dt className="site-footer-label">Directions</dt>
                <dd>
                  <a
                    href={directionsUrl(settings.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer-link site-footer-address focus-ring"
                    data-testid="link-footer-directions"
                  >
                    <span className="whitespace-pre-line">{settings.address}</span>
                    <span className="sr-only"> (opens Google Maps in a new tab)</span>
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
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
