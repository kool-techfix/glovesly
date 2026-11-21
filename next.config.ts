import type { NextConfig } from "next";

// Cache Components is intentionally off: caching uses unstable_cache +
// revalidateTag (see docs/reference/ARCHITECTURE.md §5.6).

// next/image accepts only this site's Cloudinary cloud, the same allow-list
// the API applies to media URLs (src/lib/cloudinary.ts).
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

// Old WordPress URLs (the site was served under /wp/). UNVERIFIED: check each
// path against the WordPress export before launch (docs/TODO-content.md).
const legacyRedirects: Array<[string, string]> = [
  ["/wp", "/"],
  ["/wp/about", "/about"],
  ["/wp/services", "/services"],
  ["/wp/projects", "/projects"],
  ["/wp/our-team", "/our-team"],
  ["/wp/lavarai", "/news"],
  ["/wp/contact", "/contact"],
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: cloudName
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: `/${cloudName}/**`,
          },
        ]
      : [],
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
