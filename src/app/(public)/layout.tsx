import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { settingsService } from "@/Services/settings.service";

/** Public chrome. A server component: only the nav inside the header is client-side. */
export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await settingsService.getPublic();
  return (
    <MotionProvider>
      <a href="#main" className="skip-link focus-ring" data-testid="link-skip-to-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </MotionProvider>
  );
}
