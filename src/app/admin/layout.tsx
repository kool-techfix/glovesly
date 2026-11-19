import type { Metadata } from "next";

import "./admin.css";

export const metadata: Metadata = {
  title: { template: "%s · Glovesly admin", default: "Glovesly admin" },
  robots: { index: false, follow: false },
};

/** Everything under /admin is wrapped in .admin-shell so admin styles cannot leak into the public site. */
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-shell">{children}</div>;
}
