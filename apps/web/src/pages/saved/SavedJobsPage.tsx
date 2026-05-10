import { Link } from "react-router-dom";
import { Bookmark, MapPin, Globe } from "lucide-react";
import { useSavedJobs } from "../../api/savedJobs";
import { formatRelative, formatZarRange } from "../../lib/format";
import { CompanyAvatar } from "../jobs/JobBoardPage";
import { SaveJobButton } from "../../components/SaveJobButton";

export function SavedJobsPage() {
  const { data, isLoading } = useSavedJobs();

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Bookmarks
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Saved jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data?.length ?? 0} job{data?.length === 1 ? "" : "s"} saved for later.
        </p>
      </div>

      {isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !data || data.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Bookmark size={28} className="text-slate-400" />
          <div className="text-sm text-slate-500">No saved jobs yet.</div>
          <Link to="/jobs" className="btn-primary mt-2">Browse the job board</Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {data.map((s) => (
            <li key={s.jobId}>
              <Link to={`/jobs/${s.job.id}`} className="card card-hover block p-5">
                <div className="flex items-start gap-4">
                  <CompanyAvatar name={s.job.company.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-semibold">{s.job.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {s.job.company.name}
                          </span>
                          {s.job.location && (
                            <>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={12} />
                                {s.job.location}
                              </span>
                            </>
                          )}
                          {s.job.remote && (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <Globe size={12} />
                              Remote
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Saved {formatRelative(s.savedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SaveJobButton jobId={s.job.id} />
                        {(s.job.salaryMin || s.job.salaryMax) && (
                          <span className="pill bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                            {formatZarRange(s.job.salaryMin, s.job.salaryMax)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
