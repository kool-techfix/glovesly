import type { MetadataRoute } from "next";

import { getEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getEnv().APP_URL;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/design"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
