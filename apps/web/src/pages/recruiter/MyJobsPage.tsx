import { Link } from "react-router-dom";
import { Plus, Inbox, Kanban, Pencil, Lock, Trash2, Briefcase, MapPin } from "lucide-react";
import { useCloseJob, useDeleteJob, useRecruiterJobs } from "../../api/jobs";
import { formatZarRange } from "../../lib/format";

export function MyJobsPage() {
  const { data, isLoading } = useRecruiterJobs();
  const close = useCloseJob();
  const del = useDeleteJob();

  if (isLoading) return <div className="card h-48 animate-pulse" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Hiring
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">My jobs</h1>
          <p className="mt-1 text-sm text-slate-500">Posted under your company.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary">
          <Plus size={16} />
          Post job
        </Link>
      </div>

      {!data || data.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Briefcase size={28} className="text-slate-400" />
          <div className="text-sm text-slate-500">No jobs yet.</div>
          <Link to="/recruiter/jobs/new" className="btn-primary mt-2">
            Post your first one
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {data.map((j) => (
            <li key={j.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight">{j.title}</h3>
                    {j.status === "OPEN" ? (
                      <span className="pill bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                        Open
                      </span>
                    ) : (
                      <span className="pill bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                    {j.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {j.location}
                      </span>
                    )}
                    {(j.salaryMin || j.salaryMax) && (
                      <>
                        <span>·</span>
                        <span className="tabular-nums">{formatZarRange(j.salaryMin, j.salaryMax)}</span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  to={`/recruiter/jobs/${j.id}/inbox`}
                  className="pill bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-200"
                >
                  <Inbox size={12} />
                  {j._count?.applications ?? 0} applicant{(j._count?.applications ?? 0) === 1 ? "" : "s"}
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/recruiter/jobs/${j.id}/board`} className="btn-secondary btn-xs">
                  <Kanban size={13} />
                  Board
                </Link>
                <Link to={`/recruiter/jobs/${j.id}/inbox`} className="btn-secondary btn-xs">
                  <Inbox size={13} />
                  Inbox
                </Link>
                <Link to={`/recruiter/jobs/${j.id}/edit`} className="btn-secondary btn-xs">
                  <Pencil size={13} />
                  Edit
                </Link>
                {j.status === "OPEN" && (
                  <button
                    onClick={() => {
                      if (confirm("Close this job?")) close.mutate(j.id);
                    }}
                    className="btn-secondary btn-xs"
                  >
                    <Lock size={13} />
                    Close
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Delete this job? This will also remove all applications to it."))
                      del.mutate(j.id);
                  }}
                  className="btn-danger btn-xs"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
