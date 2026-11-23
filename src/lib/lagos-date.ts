/*
 * Dates in Africa/Lagos (UTC+1 all year, no daylight saving). Dependency-free,
 * so client components can use it too.
 *
 * A vacancy deadline is stored as the END of its day in Lagos
 * (YYYY-MM-DDT23:59:59.999+01:00), so "apply by 30 January" stays open for the
 * whole of 30 January in Nigeria.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** "2027-01-30" → the last millisecond of that day in Lagos. Null for anything else. */
export function lagosEndOfDay(date: string): Date | null {
  if (!DATE_ONLY.test(date)) return null;
  const value = new Date(`${date}T23:59:59.999+01:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

/** A Date or ISO string → "YYYY-MM-DD" as seen in Lagos ("" for none). */
export function toLagosDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const lagos = new Date(date.getTime() + 60 * 60 * 1000);
  return lagos.toISOString().slice(0, 10);
}

/** Open when there is no deadline, or the deadline (end of day, Lagos) has not passed. */
export function isBeforeDeadline(deadline: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!deadline) return true;
  const date = typeof deadline === "string" ? new Date(deadline) : deadline;
  return date.getTime() >= now.getTime();
}
