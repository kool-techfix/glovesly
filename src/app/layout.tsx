import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { LOADER_HEAD_SCRIPT, LOADER_INERT_SCRIPT, PageLoader } from "@/components/page-loader";

import "./globals.css";

// PLACEHOLDER FONTS: Inter (body) and Plus Jakarta Sans (display) are temporary
// choices until the owner confirms the brand typefaces. To swap, change only
// these two loaders; everything else reads --app-font-sans / --app-font-display.
const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--app-font-sans",
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--app-font-display",
});

export const metadata: Metadata = {
  // Resolves relative Open Graph URLs. APP_URL is validated at boot (src/lib/env.ts).
  metadataBase: new URL(process.env.APP_URL?.trim() || "http://localhost:3000"),
  title: {
    template: "%s · Glovesly Pro-Project",
    default: "Glovesly Pro-Project",
  },
  description:
    "Glovesly Pro-Project is a Nigerian company working in aviation infrastructure, construction, security solutions and energy solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the head script adds loader classes and the hero
    // image sets data-hero-ready on <html> before React hydrates.
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOADER_HEAD_SCRIPT }} />
        <noscript>
          <style>{`.page-loader{display:none!important}.hero-image{opacity:1!important}[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <PageLoader />
        <div id="page-root">{children}</div>
        <script dangerouslySetInnerHTML={{ __html: LOADER_INERT_SCRIPT }} />
      </body>
    </html>
  );
}
