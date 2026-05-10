import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Briefcase, Users, Trophy, Clock } from "lucide-react";
import { APP_STATUSES } from "@smartjob/shared";
import { useRecruiterFunnel } from "../../api/recruiterAnalytics";
import { statusDotTint } from "../../components/StatusBadge";

export function RecruiterFunnelPage() {
  const { data, isLoading, error } = useRecruiterFunnel();

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

  const totalApps = data.totals.applications;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Hiring metrics
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Funnel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pipeline health across all your company's jobs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Open jobs" value={data.totals.openJobs} accent="from-brand-500 to-brand-700" Icon={Briefcase} />
        <StatCard label="Applications" value={data.totals.applications} accent="from-amber-500 to-amber-700" Icon={Users} />
        <StatCard label="Offers" value={data.totals.offers} accent="from-emerald-500 to-emerald-700" Icon={Trophy} />
        <StatCard
          label="Median days to offer"
          value={data.medianDaysToOffer == null ? "—" : data.medianDaysToOffer.toFixed(1)}
          accent="from-violet-500 to-violet-700"
          Icon={Clock}
        />
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Pipeline funnel</h2>
        <p className="mb-4 text-xs text-slate-500">Applicants currently at each stage.</p>
        <ul className="space-y-2">
          {APP_STATUSES.filter((s) => s !== "WITHDRAWN").map((s) => {
            const count = data.byStatus[s] ?? 0;
            const pct = totalApps > 0 ? (count / totalApps) * 100 : 0;
            return (
              <li key={s}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                    <span className={`h-2 w-2 rounded-full ${statusDotTint[s]}`} />
                    {s}
                  </span>
                  <span className="tabular-nums text-slate-500">{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Conversion rates</h2>
        <p className="mb-4 text-xs text-slate-500">Stage-to-stage progression.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Conversion label="Applied → Screening" value={data.conversion.appliedToScreening} />
          <Conversion label="Screening → Interview" value={data.conversion.screeningToInterview} />
          <Conversion label="Interview → Offer" value={data.conversion.interviewToOffer} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Monthly trend</h2>
        <p className="mb-4 text-xs text-slate-500">Applications received vs. offers extended.</p>
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
              />
              <Legend />
              <Bar dataKey="applications" name="Applications" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="offers" name="Offers" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  Icon,
}: {
  label: string;
  value: number | string;
  accent: string;
  Icon: typeof Briefcase;
}) {
  return (
    <div className="card group relative overflow-hidden p-5">
      <div className={`absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br ${accent} opacity-10`} />
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white shadow-sm`}>
        <Icon size={16} />
      </span>
      <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Conversion({ label, value }: { label: string; value: number }) {
  const pct = (value * 100).toFixed(0);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{pct}%</div>
    </div>
  );
}
