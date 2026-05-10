import { Link } from "react-router-dom";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { useApplications } from "../../api/applications";
import { statusColumnTint, statusDotTint } from "../../components/StatusBadge";
import { cn } from "../../lib/cn";
import { formatZar } from "../../lib/format";

export function BoardPage() {
  const { data, isLoading } = useApplications({ pageSize: 100 });
  if (isLoading) return <div className="card h-96 animate-pulse" />;

  const grouped: Record<AppStatus, NonNullable<typeof data>["items"]> = {
    APPLIED: [], SCREENING: [], INTERVIEW: [], OFFER: [], REJECTED: [],
  };
  for (const a of data?.items ?? []) grouped[a.status].push(a);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">Pipeline</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Board</h1>
        <p className="mt-1 text-sm text-slate-500">Your applications grouped by stage.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {APP_STATUSES.map((status) => (
          <div
            key={status}
            className={cn(
              "flex min-h-[60vh] flex-col rounded-xl border p-3",
              statusColumnTint[status],
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                <span className={cn("h-2 w-2 rounded-full", statusDotTint[status])} />
                {status}
              </div>
              <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm dark:bg-slate-950/80 dark:text-slate-300">
                {grouped[status].length}
              </span>
            </div>
            <div className="space-y-2">
              {grouped[status].map((a) => (
                <Link
                  key={a.id}
                  to={`/applications/${a.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-2.5 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.company}</div>
                      <div className="truncate text-xs text-slate-500">{a.role}</div>
                    </div>
                    {a.jobApplicationId && (
                      <span className="pill bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" title="In-platform">
                        IN
                      </span>
                    )}
                  </div>
                  {a.salary && (
                    <div className="mt-1 text-[11px] text-slate-500 tabular-nums">{formatZar(a.salary)}</div>
                  )}
                </Link>
              ))}
              {grouped[status].length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-2 text-center text-[11px] text-slate-400 dark:border-slate-700 dark:bg-slate-950/40">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
