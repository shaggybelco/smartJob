import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Building2, Sparkles } from "lucide-react";
import { useJob } from "../../api/jobs";
import { useAuth } from "../../lib/auth";
import { formatZarRange } from "../../lib/format";
import { CompanyAvatar } from "./JobBoardPage";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: job, isLoading } = useJob(id);

  const inShell = !!user;
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    inShell ? (
      <div className="space-y-4">{children}</div>
    ) : (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
                <Sparkles size={16} strokeWidth={2.5} />
              </span>
              <span className="text-base font-semibold tracking-tight">Smart Job</span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link to="/jobs" className="btn-ghost">Browse</Link>
              <Link to="/login" className="btn-primary">Sign in</Link>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-6 py-8">{children}</div>
      </div>
    );

  if (isLoading) return <Wrapper><div className="card h-48 animate-pulse" /></Wrapper>;
  if (!job) return <Wrapper><div className="card p-6 text-rose-600">Job not found.</div></Wrapper>;

  const closed = job.status === "CLOSED";

  return (
    <Wrapper>
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        Back to job board
      </Link>

      <article className="card overflow-hidden">
        <div className="border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <CompanyAvatar name={job.company.name} size={56} />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Building2 size={14} />
                  {job.company.name}
                </span>
                {job.location && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(job.salaryMin || job.salaryMax) && (
                  <span className="pill bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                    {formatZarRange(job.salaryMin, job.salaryMax)}
                  </span>
                )}
                {closed ? (
                  <span className="pill bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    Closed
                  </span>
                ) : (
                  <span className="pill bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                    Open
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {closed && (
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              This job is no longer accepting applications.
            </div>
          )}
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-200">
            {job.description}
          </div>

          <div className="mt-6 flex items-center gap-3">
            {!user ? (
              <Link to="/login" className="btn-primary">Sign in to apply</Link>
            ) : user.role === "APPLICANT" && !closed ? (
              <Link to={`/jobs/${job.id}/apply`} className="btn-primary">Apply now</Link>
            ) : user.role === "RECRUITER" ? (
              <span className="text-sm text-slate-500">Recruiter accounts can't apply.</span>
            ) : null}
          </div>
        </div>
      </article>
    </Wrapper>
  );
}
