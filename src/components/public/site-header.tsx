import { Logo } from "@/components/public/logo";
import { SiteNav } from "@/components/public/site-nav";
import { ctaLabel, mainNav } from "@/data/content";

/** Fixed header. Server component; only the nav (active item, mobile menu) is client-side. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container-wide site-header-inner">
        <Logo priority testId="link-header-logo" />
        <SiteNav items={mainNav} ctaLabel={ctaLabel} />
      </div>
    </header>
  );
}
