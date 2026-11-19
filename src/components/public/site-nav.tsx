"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { NavItem } from "@/data/content";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items, ctaLabel }: { items: NavItem[]; ctaLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating (state adjusted during render).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape closes the menu; the page behind does not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Main" className="site-nav-desktop">
        <ul className="site-nav-list">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="nav-link focus-ring"
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                data-testid={`link-nav-${item.key}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Link href="/contact" className="nav-cta focus-ring" data-testid="link-header-cta">
        <span>{ctaLabel}</span>
        <ArrowUpRight aria-hidden="true" className="nav-cta-icon" />
      </Link>

      <button
        type="button"
        className="site-menu-button focus-ring"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        data-testid="button-header-menu"
      >
        {open ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
      </button>

      <div id="site-mobile-menu" className={cn("site-mobile-menu", open && "is-open")} hidden={!open}>
        <nav aria-label="Main (mobile)">
          <ul className="site-mobile-list">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="site-mobile-link focus-ring"
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  data-testid={`link-mobile-nav-${item.key}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/contact" className="nav-cta nav-cta-block focus-ring" data-testid="link-mobile-cta">
          <span>{ctaLabel}</span>
          <ArrowUpRight aria-hidden="true" className="nav-cta-icon" />
        </Link>
      </div>
    </>
  );
}
