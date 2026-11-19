import { formatDistanceToNowStrict } from "date-fns";

/*
 * Absolute dates are shown in Nigerian time (WAT) so the server render and the
 * browser agree, whatever timezone either runs in. Relative times change
 * between render and hydration; render them with <TimeAgo> (admin-parts).
 */
const TIME_ZONE = "Africa/Lagos";
const dateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "short", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "3 minutes ago", "2 days ago". */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

/** "19 Nov 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateFormat.format(new Date(iso));
}

/** "19 Nov 2026, 14:05". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateTimeFormat.format(new Date(iso));
}

/** "Ada Obi" → "AO". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0]![0], parts[parts.length - 1]![0]] : [parts[0]?.[0], parts[0]?.[1]];
  return letters.filter(Boolean).join("").toUpperCase() || "?";
}

/** "PRIVATE_CLIENT" → "Private client". */
export function humanise(value: string): string {
  const lower = value.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
