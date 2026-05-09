import type { AppStatus } from "@smartjob/shared";
import { cn } from "../lib/cn";

const styles: Record<AppStatus, string> = {
  APPLIED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  SCREENING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  INTERVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  OFFER: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
};

export function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
}
