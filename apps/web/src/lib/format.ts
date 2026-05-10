/**
 * Currency formatting helpers. We format in South African Rand (ZAR) using
 * the en-ZA locale, which renders e.g. 950000 → "R 950 000".
 */

const zarFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

/** Single salary value. Returns "—" for null/undefined. */
export function formatZar(value: number | null | undefined): string {
  if (value == null) return "—";
  return zarFormatter.format(value);
}

/** Salary range. Returns "—" if both sides are null. */
export function formatZarRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${zarFormatter.format(min)} – ${zarFormatter.format(max)}`;
  if (min != null) return `${zarFormatter.format(min)}+`;
  return `Up to ${zarFormatter.format(max!)}`;
}

/**
 * Human-friendly "5 minutes ago", "2 days ago", "in 3 hours". Used by inbox
 * feeds to time-stamp activity rows.
 */
export function formatRelative(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const diffMs = date.getTime() - Date.now();
  const seconds = Math.round(diffMs / 1000);
  const abs = Math.abs(seconds);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return rtf.format(seconds, "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 604_800) return rtf.format(Math.round(seconds / 86_400), "day");
  if (abs < 2_592_000) return rtf.format(Math.round(seconds / 604_800), "week");
  if (abs < 31_536_000) return rtf.format(Math.round(seconds / 2_592_000), "month");
  return rtf.format(Math.round(seconds / 31_536_000), "year");
}
