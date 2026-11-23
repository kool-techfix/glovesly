"use client";

import {
  Briefcase,
  ExternalLink,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Settings,
  UserCog,
  Users,
  X,
  BriefcaseBusiness,
  FileUser,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { LogoImage } from "@/components/brand-logo";
import { useAdmin } from "@/lib/admin/admin-store";
import { api, errorMessage } from "@/lib/admin/api-client";
import { initials } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  key: string;
  adminOnly?: boolean;
};

const NAV: Array<{ heading?: string; items: NavItem[] }> = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" }] },
  {
    heading: "Content",
    items: [
      { href: "/admin/services", label: "Services", icon: Briefcase, key: "services" },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban, key: "projects" },
      { href: "/admin/news", label: "News", icon: Newspaper, key: "news" },
      { href: "/admin/team", label: "Team", icon: Users, key: "team" },
      { href: "/admin/partners", label: "Partners", icon: Handshake, key: "partners" },
      { href: "/admin/vacancies", label: "Vacancies", icon: BriefcaseBusiness, key: "vacancies" },
    ],
  },
  {
    heading: "Workspace",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Mail, key: "messages" },
      { href: "/admin/applications", label: "Applications", icon: FileUser, key: "applications" },
      { href: "/admin/users", label: "Users", icon: UserCog, key: "users", adminOnly: true },
      { href: "/admin/settings", label: "Settings", icon: Settings, key: "settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, isAdmin, summary } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating (adjusting state during render, not in an effect).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const badges: Record<string, { count: number; label: string; tone?: "warning" } | undefined> = {
    messages: summary.unreadMessages ? { count: summary.unreadMessages, label: "unread" } : undefined,
    applications: summary.newApplications ? { count: summary.newApplications, label: "new" } : undefined,
    projects: summary.projectsWithoutState
      ? { count: summary.projectsWithoutState, label: "without a state", tone: "warning" }
      : undefined,
  };

  async function signOut() {
    setSigningOut(true);
    try {
      await api("/api/auth/logout", { method: "POST", noAuthRedirect: true });
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setSigningOut(false);
    }
  }

  return (
    <div className="adm-app">
      <a href="#adm-main" className="adm-skip-link" data-testid="link-admin-skip">
        Skip to content
      </a>

      <aside className={cn("adm-sidebar", menuOpen && "is-open")} id="adm-sidebar" aria-label="Admin navigation">
        <div className="adm-brand">
          <LogoImage size={40} tile alt="" />
          <span>
            <span className="adm-brand-name">Glovesly</span>
            <span className="adm-brand-sub">Admin workspace</span>
          </span>
        </div>
        <nav className="adm-nav">
          {NAV.map((group, index) => {
            const items = group.items.filter((item) => !item.adminOnly || isAdmin);
            if (!items.length) return null;
            return (
              <div key={group.heading ?? index} className="adm-nav-group">
                {group.heading ? <p className="adm-nav-heading">{group.heading}</p> : null}
                <ul>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    const badge = badges[item.key];
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="adm-nav-link"
                          aria-current={active ? "page" : undefined}
                          data-testid={`link-admin-nav-${item.key}`}
                        >
                          <Icon size={18} aria-hidden />
                          <span>{item.label}</span>
                          {badge ? (
                            <span className={cn("adm-nav-badge", badge.tone === "warning" && "adm-nav-badge--warning")}>
                              {badge.count}
                              <span className="adm-visually-hidden"> {badge.label}</span>
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="adm-sidebar-footer">
          <a href="/" target="_blank" rel="noreferrer" className="adm-nav-link" data-testid="link-admin-view-site">
            <ExternalLink size={18} aria-hidden />
            <span>View site</span>
            <span className="adm-visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="adm-scrim"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          data-testid="button-admin-menu-scrim"
        />
      ) : null}

      <div className="adm-main-column">
        <header className="adm-header">
          <button
            type="button"
            className="adm-icon-button adm-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="adm-sidebar"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            data-testid="button-admin-menu"
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>

          <div className="adm-header-badges">
            {summary.reviewQueue > 0 ? (
              <Link href="/admin" className="adm-header-pill adm-header-pill--review" data-testid="link-admin-review-queue">
                {summary.reviewQueue} waiting for review
              </Link>
            ) : null}
            {summary.unreadMessages > 0 ? (
              <Link href="/admin/messages" className="adm-header-pill adm-header-pill--info" data-testid="link-admin-unread">
                {summary.unreadMessages} unread {summary.unreadMessages === 1 ? "message" : "messages"}
              </Link>
            ) : null}
          </div>

          <div className="adm-user">
            <span className="adm-avatar" aria-hidden>
              {initials(me.name)}
            </span>
            <span className="adm-user-text">
              <span className="adm-user-name">{me.name}</span>
              <span className="adm-user-role">{me.role === "ADMIN" ? "Administrator" : "Editor"}</span>
            </span>
            <button
              type="button"
              className="adm-button adm-button--ghost adm-button--sm"
              onClick={signOut}
              disabled={signingOut}
              data-testid="button-admin-sign-out"
            >
              <LogOut size={16} aria-hidden /> Sign out
            </button>
          </div>
        </header>

        <main id="adm-main" className="adm-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
