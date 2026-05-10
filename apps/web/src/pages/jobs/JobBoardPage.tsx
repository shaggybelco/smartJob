import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Sparkles } from "lucide-react";
import { usePublicJobs } from "../../api/jobs";
import { useAuth } from "../../lib/auth";
import { formatZarRange } from "../../lib/format";

export function JobBoardPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const { data, isLoading } = usePublicJobs({ q, location, pageSize: 50 });

  const inShell = !!user;

  return (
    <div className={inShell ? "space-y-6" : "min-h-screen bg-slate-50 dark:bg-slate-950"}>
      {!inShell && (
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
                <Sparkles size={16} strokeWidth={2.5} />
              </span>
              <span className="text-base font-semibold tracking-tight">Smart Job</span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          </div>
        </header>
      )}

      <section className={inShell ? "" : "mx-auto max-w-5xl px-6 pt-10"}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Open roles
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Find your next role</h1>
            <p className="mt-1 text-sm text-slate-500">
              {data?.total ?? 0} {data?.total === 1 ? "job" : "jobs"} hiring right now.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="card mt-6 flex flex-col gap-2 p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, description, company…"
              className="input pl-9"
            />
          </div>
          <div className="relative sm:w-56">
            <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="input pl-9"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-28 animate-pulse bg-slate-100 dark:bg-slate-900" />
              ))}
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
              <Briefcase size={28} className="text-slate-400" />
              <div className="text-sm text-slate-500">No open jobs match your search.</div>
            </div>
          ) : (
            <ul className="grid gap-3">
              {data.items.map((job) => (
                <li key={job.id}>
                  <Link to={`/jobs/${job.id}`} className="card card-hover block p-5">
                    <div className="flex items-start gap-4">
                      <CompanyAvatar name={job.company.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-lg font-semibold text-slate-900 group-hover:text-brand-700 dark:text-slate-100">
                              {job.title}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {job.company.name}
                              </span>
                              {job.location && (
                                <>
                                  <span>·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin size={12} />
                                    {job.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {(job.salaryMin || job.salaryMax) && (
                            <span className="pill bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                              {formatZarRange(job.salaryMin, job.salaryMax)}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                          {job.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {!inShell && <div className="h-12" />}
    </div>
  );
}

export function CompanyAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-sm"
      style={{ width: size, height: size }}
    >
      {initials || "?"}
    </div>
  );
}
