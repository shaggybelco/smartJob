import { Link } from "react-router-dom";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { useApplications } from "../../api/applications";

// Drag-and-drop wiring will be added in a follow-on plan; this is a static
// columnar view that already groups applications by status.
export function BoardPage() {
  const { data, isLoading } = useApplications({ pageSize: 100 });
  if (isLoading) return <div>Loading…</div>;

  const grouped: Record<AppStatus, NonNullable<typeof data>["items"]> = {
    APPLIED: [], SCREENING: [], INTERVIEW: [], OFFER: [], REJECTED: [],
  };
  for (const a of data?.items ?? []) grouped[a.status].push(a);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Board</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {APP_STATUSES.map((status) => (
          <div
            key={status}
            className="flex min-h-[60vh] flex-col rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
              <span>{status}</span>
              <span>{grouped[status].length}</span>
            </div>
            <div className="space-y-2">
              {grouped[status].map((a) => (
                <Link
                  key={a.id}
                  to={`/applications/${a.id}`}
                  className="block rounded-md border border-slate-200 bg-slate-50 p-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <div className="font-medium">{a.company}</div>
                  <div className="text-xs text-slate-500">{a.role}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
