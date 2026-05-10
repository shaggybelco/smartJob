import { Link } from "react-router-dom";
import { Inbox, FileText } from "lucide-react";
import { useMyJobApplications } from "../../api/jobApplications";
import { StatusBadge } from "../../components/StatusBadge";
import { apiUrl } from "../../api/client";
import { formatRelative } from "../../lib/format";

/**
 * Applicant inbox — recent activity on the applicant's in-platform applications.
 * Sorted by most recently updated. Each row is a "what happened" digest.
 */
export function InboxPage() {
  const { data: items, isLoading } = useMyJobApplications();

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Activity
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Inbox</h1>
        <p className="mt-1 text-sm text-slate-500">
          Updates on jobs you've applied to through the platform.
        </p>
      </div>

      {isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !items || items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Inbox size={28} className="text-slate-400" />
          <div className="text-sm text-slate-500">
            Nothing here yet. Apply to a job to start tracking updates.
          </div>
          <Link to="/jobs" className="btn-primary mt-2">
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((ja) => {
            const isNew = ja.createdAt === ja.updatedAt;
            const headline = isNew
              ? `Application submitted to ${ja.job.company.name}`
              : `Status updated: ${ja.status}`;

            return (
              <li key={ja.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-sm">
                      {(ja.job.company.name[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold tracking-tight">{headline}</div>
                      <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                        <Link
                          to={`/jobs/${ja.job.id}`}
                          className="text-brand-700 hover:underline dark:text-brand-300"
                        >
                          {ja.job.title}
                        </Link>{" "}
                        @ {ja.job.company.name}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {formatRelative(ja.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={ja.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {ja.resumeStorageKey && (
                    <a
                      href={apiUrl(`/resumes/${ja.id}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="pill bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <FileText size={12} />
                      {ja.resumeFilename ?? "CV"}
                    </a>
                  )}
                  <Link to="/applications" className="pill bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-200">
                    Open in tracker →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
