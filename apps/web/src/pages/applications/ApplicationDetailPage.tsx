import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Info, Ban } from "lucide-react";
import {
  useApplication,
  useDeleteApplication,
  useUpdateApplication,
} from "../../api/applications";
import { useWithdrawApplication } from "../../api/jobApplications";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { StatusBadge } from "../../components/StatusBadge";
import { formatZar } from "../../lib/format";

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useApplication(id);
  const update = useUpdateApplication(id ?? "");
  const del = useDeleteApplication();
  const withdraw = useWithdrawApplication();

  if (isLoading) return <div className="card h-48 animate-pulse" />;
  if (!data) return <div className="card p-6 text-rose-600">Not found.</div>;

  const linked = !!data.jobApplicationId;
  const withdrawn = data.status === "WITHDRAWN";

  const onDelete = async () => {
    if (!confirm("Delete this application?")) return;
    await del.mutateAsync(data.id);
    navigate("/applications");
  };

  const onWithdraw = async () => {
    if (!data.jobApplicationId) return;
    if (!confirm("Withdraw this application? The recruiter will see it as withdrawn.")) return;
    await withdraw.mutateAsync(data.jobApplicationId);
  };

  return (
    <div className="space-y-5">
      <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        All applications
      </Link>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{data.company}</h1>
              {linked && (
                <span className="pill bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  In-platform
                </span>
              )}
            </div>
            <div className="mt-0.5 text-slate-500">{data.role}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={data.status} />
            <select
              value={data.status}
              disabled={linked}
              onChange={(e) => update.mutate({ status: e.target.value as AppStatus })}
              className="input w-auto disabled:cursor-not-allowed"
              title={linked ? "Status is managed by the recruiter" : "Change status"}
            >
              {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {linked && !withdrawn && (
              <button
                onClick={onWithdraw}
                disabled={withdraw.isPending}
                className="btn-secondary"
                title="Withdraw your application"
              >
                <Ban size={14} />
                Withdraw
              </button>
            )}
            <button onClick={onDelete} className="btn-danger">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {linked && !withdrawn && (
          <div className="flex items-start gap-2 border-t border-brand-100 bg-brand-50 px-5 py-3 text-sm text-brand-800 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-200">
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>
              You applied through the job board. The recruiter manages the status; your notes
              and reminders below stay private.
            </span>
          </div>
        )}
        {withdrawn && (
          <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            You withdrew this application.
          </div>
        )}
      </div>

      <dl className="card grid grid-cols-2 gap-y-3 p-5 text-sm md:grid-cols-3">
        <Term label="Source" value={data.source ?? "—"} />
        <Term label="Salary" value={formatZar(data.salary)} />
        <Term label="Location" value={data.location ?? "—"} />
        <Term label="Applied" value={new Date(data.appliedAt).toLocaleDateString()} />
        <Term
          label="Job URL"
          value={
            data.jobUrl ? (
              <a className="text-brand-600 hover:underline" href={data.jobUrl} target="_blank" rel="noreferrer">
                Open ↗
              </a>
            ) : (
              "—"
            )
          }
        />
      </dl>

      {data.notes && (
        <div className="card p-5 text-sm">
          <div className="label">Notes</div>
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{data.notes}</div>
        </div>
      )}
    </div>
  );
}

function Term({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}
