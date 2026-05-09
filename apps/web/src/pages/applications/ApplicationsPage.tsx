import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplications } from "../../api/applications";
import { StatusBadge } from "../../components/StatusBadge";
import { APP_STATUSES } from "@smartjob/shared";

export function ApplicationsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const { data, isLoading } = useApplications({ q, status: status || undefined });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <Link
          to="/applications/new"
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company or role…"
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">All statuses</option>
          {APP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div>Loading…</div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
          No applications yet. <Link to="/applications/new" className="text-brand-600 hover:underline">Add your first one.</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Applied</th>
                <th className="px-3 py-2">Salary</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  <td className="px-3 py-2">
                    <Link to={`/applications/${a.id}`} className="font-medium text-brand-600 hover:underline">
                      {a.company}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{a.role}</td>
                  <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(a.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {a.salary ? `$${a.salary.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
