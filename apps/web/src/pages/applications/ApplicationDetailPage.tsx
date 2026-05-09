import { useNavigate, useParams } from "react-router-dom";
import {
  useApplication,
  useDeleteApplication,
  useUpdateApplication,
} from "../../api/applications";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { StatusBadge } from "../../components/StatusBadge";

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useApplication(id);
  const update = useUpdateApplication(id ?? "");
  const del = useDeleteApplication();

  if (isLoading) return <div>Loading…</div>;
  if (!data) return <div className="text-rose-600">Not found.</div>;

  const onDelete = async () => {
    if (!confirm("Delete this application?")) return;
    await del.mutateAsync(data.id);
    navigate("/applications");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{data.company}</h1>
          <div className="text-slate-500">{data.role}</div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={data.status} />
          <select
            value={data.status}
            onChange={(e) => update.mutate({ status: e.target.value as AppStatus })}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={onDelete}
            className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            Delete
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
        <Term label="Source" value={data.source ?? "—"} />
        <Term label="Salary" value={data.salary ? `$${data.salary.toLocaleString()}` : "—"} />
        <Term label="Location" value={data.location ?? "—"} />
        <Term label="Applied" value={new Date(data.appliedAt).toLocaleDateString()} />
        <Term label="Job URL" value={
          data.jobUrl
            ? <a className="text-brand-600 hover:underline" href={data.jobUrl} target="_blank" rel="noreferrer">{data.jobUrl}</a>
            : "—"
        } />
      </dl>

      {data.notes && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-1 font-medium">Notes</div>
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{data.notes}</div>
        </div>
      )}
    </div>
  );
}

function Term({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
