export const SLUG_MAX_LENGTH = 80;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Lagos Airport — Phase 2" → "lagos-airport-phase-2". Falls back to "item". */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
  return slug || "item";
}

/**
 * Returns `base`, or `base-2`, `base-3`… for the first value `isTaken`
 * rejects. After 50 tries it appends a random suffix.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base);
  if (!(await isTaken(root))) return root;

  for (let n = 2; n <= 50; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${root.slice(0, SLUG_MAX_LENGTH - suffix.length)}${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  const random = `-${Math.random().toString(36).slice(2, 8)}`;
  return `${root.slice(0, SLUG_MAX_LENGTH - random.length)}${random}`;
}
