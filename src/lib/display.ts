import { PARTNER_TYPE_LABELS, PROJECT_SECTOR_LABELS, PROJECT_STATUS_LABELS, type PartnerType, type ProjectSector, type ProjectStatus } from "@/lib/domain";

/* Display helpers for public pages. Dates are shown in Nigerian time (WAT). */

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatLongDate(iso: string | null | undefined): string {
  return iso ? dateFormat.format(new Date(iso)) : "";
}

export const sectorLabel = (sector: ProjectSector) => PROJECT_SECTOR_LABELS[sector];
export const projectStatusLabel = (status: ProjectStatus) => PROJECT_STATUS_LABELS[status];
export const partnerTypeLabel = (type: PartnerType) => PARTNER_TYPE_LABELS[type];

/** Splits editor text (plain textarea) into paragraphs on blank lines. */
export function toParagraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Short description for metadata: first ~160 characters. */
export function excerpt(text: string | null | undefined, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase() || "?";
}
