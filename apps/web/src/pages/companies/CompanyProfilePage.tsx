import { Link, useParams } from "react-router-dom";
import { Building2, ExternalLink, MapPin, Globe, Sparkles, ArrowLeft } from "lucide-react";
import { useCompany } from "../../api/companies";
import { useAuth } from "../../lib/auth";
import { CompanyAvatar } from "../jobs/JobBoardPage";
import { formatZarRange } from "../../lib/format";
import { SaveJobButton } from "../../components/SaveJobButton";

export function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading } = useCompany(id);

  const inShell = !!user;
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    inShell ? (
      <div className="space-y-5">{children}</div>
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
            <Link to="/jobs" className="btn-ghost text-sm">Browse jobs</Link>
          </div>
        </header>
        <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">{children}</div>
      </div>
    );

  if (isLoading) return <Wrapper><div className="card h-48 animate-pulse" /></Wrapper>;
  if (!data) return <Wrapper><div className="card p-6 text-rose-600">Company not found.</div></Wrapper>;

  return (
    <Wrapper>
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        Back to jobs
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <CompanyAvatar name={data.name} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
            <div className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
              <Building2 size={14} />
              {data._count.jobs} open role{data._count.jobs === 1 ? "" : "s"}
            </div>
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
              >
                <ExternalLink size={13} />
                {data.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
        {data.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {data.description}
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Open roles</h2>
        {data.jobs.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-500">
            No open roles right now.
          </div>
        ) : (
          <ul className="grid gap-3">
            {data.jobs.map((job) => (
              <li key={job.id}>
                <Link to={`/jobs/${job.id}`} className="card card-hover block p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold">{job.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {job.location}
                          </span>
                        )}
                        {job.remote && (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <Globe size={12} />
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SaveJobButton jobId={job.id} />
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="pill bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                          {formatZarRange(job.salaryMin, job.salaryMax)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  );
}
