import type { AppStatus } from "@smartjob/shared";
import { cn } from "../lib/cn";

const styles: Record<AppStatus, { wrap: string; dot: string }> = {
  APPLIED: {
    wrap: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    dot: "bg-slate-400",
  },
  SCREENING: {
    wrap: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
    dot: "bg-blue-500",
  },
  INTERVIEW: {
    wrap: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  OFFER: {
    wrap: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    wrap: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
    dot: "bg-rose-500",
  },
};

export function StatusBadge({ status }: { status: AppStatus }) {
  const s = styles[status];
  return (
    <span className={cn("pill", s.wrap)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {status}
    </span>
  );
}

/** Map a status to background tint used by board column headers. */
export const statusColumnTint: Record<AppStatus, string> = {
  APPLIED: "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800",
  SCREENING: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40",
  INTERVIEW: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40",
  OFFER: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40",
  REJECTED: "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40",
};

export const statusDotTint: Record<AppStatus, string> = {
  APPLIED: "bg-slate-400",
  SCREENING: "bg-blue-500",
  INTERVIEW: "bg-amber-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-rose-500",
};
