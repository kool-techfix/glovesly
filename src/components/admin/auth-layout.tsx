import { LogoImage } from "@/components/brand-logo";

/** Split-screen layout for login, forgot-password and reset-password. */
export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="adm-auth">
      <div className="adm-auth-panel">
        <div className="adm-brand adm-brand--on-dark">
          <LogoImage size={56} tile priority />
          <span aria-hidden="true">
            <span className="adm-brand-name">Glovesly Pro-Project</span>
            <span className="adm-brand-sub">Admin workspace</span>
          </span>
        </div>
        <p className="adm-auth-panel-text" aria-hidden="true">Manage services, projects, news, the team and partners for the public website.</p>
      </div>
      <main className="adm-auth-main">
        <div className="adm-auth-card">
          <h1 className="adm-auth-title">{title}</h1>
          {description ? <p className="adm-auth-description">{description}</p> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
