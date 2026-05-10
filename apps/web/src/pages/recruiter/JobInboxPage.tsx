import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Kanban, FileText, Inbox } from "lucide-react";
import { useJob, useJobInbox } from "../../api/jobs";
import { useUpdateJobApplication } from "../../api/jobApplications";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { StatusBadge } from "../../components/StatusBadge";
import { apiUrl } from "../../api/client";

export function JobInboxPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job } = useJob(id);
  const { data: items, isLoading } = useJobInbox(id);

  return (
    <div className="space-y-5">
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        My jobs
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Pipeline
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Applicants{job ? ` — ${job.title}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items?.length ?? 0} application{items?.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link to={`/recruiter/jobs/${id}/board`} className="btn-secondary">
          <Kanban size={14} />
          Board view
        </Link>
      </div>

      {isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !items || items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Inbox size={28} className="text-slate-400" />
          <div className="text-sm text-slate-500">No applications yet.</div>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((ja) => (
            <InboxRow key={ja.id} ja={ja} />
          ))}
        </ul>
      )}
    </div>
  );
}

function InboxRow({
  ja,
}: {
  ja: {
    id: string;
    coverLetter?: string | null;
    resumeUrl?: string | null;
    resumeStorageKey?: string | null;
    resumeFilename?: string | null;
    status: AppStatus;
    recruiterNote?: string | null;
    createdAt: string;
    applicant: { id: string; name: string; email: string };
  };
}) {
  const update = useUpdateJobApplication(ja.id);

  const initials = ja.applicant.name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <Link
              to={`/recruiter/applications/${ja.id}`}
              className="font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              {ja.applicant.name}
            </Link>
            <div className="text-xs text-slate-500">
              {ja.applicant.email} · applied {new Date(ja.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={ja.status} />
          <select
            value={ja.status}
            onChange={(e) => update.mutate({ status: e.target.value as AppStatus })}
            className="input w-auto"
          >
            {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Link to={`/recruiter/applications/${ja.id}`} className="btn-secondary btn-xs">
            View
          </Link>
        </div>
      </div>

      {ja.coverLetter ? (
        <div className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
          {ja.coverLetter}
        </div>
      ) : (
        <div className="mt-3 text-xs italic text-slate-400">No cover letter</div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {ja.resumeStorageKey && (
          <a
            href={apiUrl(`/resumes/${ja.id}`)}
            target="_blank"
            rel="noreferrer"
            className="pill bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-200"
          >
            <FileText size={12} />
            {ja.resumeFilename ?? "CV"}
          </a>
        )}
        {ja.resumeUrl && (
          <a
            href={ja.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="pill bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Resume URL ↗
          </a>
        )}
      </div>

      <div className="mt-3">
        <textarea
          defaultValue={ja.recruiterNote ?? ""}
          placeholder="Private recruiter note…"
          rows={2}
          onBlur={(e) => {
            if ((e.target.value || "") !== (ja.recruiterNote ?? "")) {
              update.mutate({ recruiterNote: e.target.value || null });
            }
          }}
          className="input resize-none text-xs"
        />
      </div>
    </li>
  );
}
