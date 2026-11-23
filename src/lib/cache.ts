import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

/*
 * Caching without Cache Components (ARCHITECTURE.md §5.6).
 * Public reads are wrapped in unstable_cache, tagged `content:<module>`, with
 * a one-hour backstop. Admin mutations call revalidateContent(), which expires
 * the tag immediately ({ expire: 0 }) and revalidates the public pages.
 * If Cache Components is enabled later, swap unstable_cache for "use cache" +
 * cacheTag here; callers keep the same interface.
 */

export type ContentModule = "services" | "projects" | "news" | "team" | "partners" | "vacancies";

export const CACHE_BACKSTOP_SECONDS = 3600;

/** Public pages that render each module, plus its detail route (if any). */
export const publicPaths: Record<
  ContentModule,
  { pages: string[]; detail?: (slug: string) => string }
> = {
  services: { pages: ["/", "/services"], detail: (slug) => `/services/${slug}` },
  projects: { pages: ["/", "/projects"], detail: (slug) => `/projects/${slug}` },
  news: { pages: ["/", "/news"], detail: (slug) => `/news/${slug}` },
  team: { pages: ["/our-team", "/about"] },
  partners: { pages: ["/", "/about"] },
  vacancies: { pages: ["/careers", "/careers/apply"], detail: (slug) => `/careers/${slug}` },
};

export function contentTag(module: ContentModule) {
  return `content:${module}`;
}

export const WORKSPACE_TAG = "workspace";

/**
 * Runs `fn` through unstable_cache. Results must be JSON-serialisable
 * (return DTOs with ISO date strings, not Prisma records).
 */
export function cachedContent<T>(
  module: ContentModule,
  keyParts: string[],
  fn: () => Promise<T>,
): Promise<T> {
  return unstable_cache(fn, ["content", module, ...keyParts], {
    tags: [contentTag(module)],
    revalidate: CACHE_BACKSTOP_SECONDS,
  })();
}

/** Same as cachedContent for workspace settings (contact details, offices, stats). */
export function cachedWorkspace<T>(keyParts: string[], fn: () => Promise<T>): Promise<T> {
  return unstable_cache(fn, ["workspace", ...keyParts], {
    tags: [WORKSPACE_TAG],
    revalidate: CACHE_BACKSTOP_SECONDS,
  })();
}

/** Call after any admin mutation that changes what the public site shows. */
export function revalidateContent(module: ContentModule, slugs: Array<string | null | undefined> = []) {
  revalidateTag(contentTag(module), { expire: 0 });

  const paths = publicPaths[module];
  for (const page of paths.pages) revalidatePath(page);
  if (paths.detail) {
    for (const slug of new Set(slugs)) {
      if (slug) revalidatePath(paths.detail(slug));
    }
  }
}

/** Workspace settings appear in the layout (footer, contact), so revalidate everything. */
export function revalidateWorkspace() {
  revalidateTag(WORKSPACE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
