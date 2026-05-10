import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Inbox } from "lucide-react";
import { useApplications } from "../../api/applications";
import { StatusBadge } from "../../components/StatusBadge";
import { APP_STATUSES } from "@smartjob/shared";
import { formatZar } from "../../lib/format";

export function ApplicationsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const { data, isLoading } = useApplications({ q, status: status || undefined });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Tracker
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everything you've applied for — on and off the platform.
          </p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus size={16} />
          New
        </Link>
      </div>

      <div className="card flex flex-col gap-2 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search company or role…"
            className="input pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-44">
          <option value="">All statuses</option>
          {APP_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !data || data.items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Inbox size={28} className="text-slate-400" />
          <div className="text-sm text-slate-500">No applications yet.</div>
          <Link to="/applications/new" className="btn-primary mt-2">
            Add your first one
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3">Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.items.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <Link
                      to={`/applications/${a.id}`}
                      className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {a.company}
                    </Link>
                    {a.jobApplicationId && (
                      <span
                        className="pill ml-2 bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                        title="Submitted in-platform"
                      >
                        In-platform
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{a.role}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(a.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500 tabular-nums">{formatZar(a.salary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
