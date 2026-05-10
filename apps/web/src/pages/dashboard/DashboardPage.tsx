import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Calendar, Trophy, XCircle, Briefcase } from "lucide-react";
import { useAnalyticsSummary } from "../../api/analytics";

const cardConfig = [
  { key: "applications", label: "Applications", Icon: FileText, accent: "from-brand-500 to-brand-700", text: "text-brand-700 dark:text-brand-300" },
  { key: "interviews", label: "Interviews", Icon: Calendar, accent: "from-amber-500 to-amber-700", text: "text-amber-700 dark:text-amber-300" },
  { key: "offers", label: "Offers", Icon: Trophy, accent: "from-emerald-500 to-emerald-700", text: "text-emerald-700 dark:text-emerald-300" },
  { key: "rejections", label: "Rejections", Icon: XCircle, accent: "from-rose-500 to-rose-700", text: "text-rose-700 dark:text-rose-300" },
] as const;

export function DashboardPage() {
  const { data, isLoading, error } = useAnalyticsSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
        <div className="card h-72 animate-pulse" />
      </div>
    );
  }
  if (error || !data) return <div className="text-rose-600">Failed to load analytics.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">Overview</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cardConfig.map(({ key, label, Icon, accent, text }) => (
          <div key={key} className="card group relative overflow-hidden p-5">
            <div className={`absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br ${accent} opacity-10`} />
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white shadow-sm`}>
                <Icon size={16} />
              </span>
            </div>
            <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
            <div className={`mt-1 text-3xl font-semibold tabular-nums ${text}`}>
              {(data.totals as Record<string, number>)[key]}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Applications per month</h2>
        <p className="mb-4 text-xs text-slate-500">Across all your applications, off-platform and in-platform.</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.2)" />
              <XAxis dataKey="month" stroke="currentColor" fontSize={11} />
              <YAxis allowDecimals={false} stroke="currentColor" fontSize={11} />
              <Tooltip
                contentStyle={{
                  border: "1px solid rgb(226 232 240)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: "rgb(37 99 235 / 0.05)" }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Link
        to="/jobs"
        className="card card-hover flex items-center justify-between p-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Briefcase size={16} />
          </span>
          <div>
            <div className="text-sm font-medium">Browse the job board</div>
            <div className="text-xs text-slate-500">Find new roles to apply to.</div>
          </div>
        </div>
        <span className="text-sm text-brand-600">Open →</span>
      </Link>
    </div>
  );
}
