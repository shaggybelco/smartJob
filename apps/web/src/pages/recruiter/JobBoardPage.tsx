import { Link, useParams } from "react-router-dom";
import { ArrowLeft, List, FileText } from "lucide-react";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { useJob, useJobInbox } from "../../api/jobs";
import { useUpdateJobApplication } from "../../api/jobApplications";
import { apiUrl } from "../../api/client";
import { statusColumnTint, statusDotTint } from "../../components/StatusBadge";
import { cn } from "../../lib/cn";

export function RecruiterJobBoardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job } = useJob(id);
  const { data: items, isLoading } = useJobInbox(id);

  if (isLoading) return <div className="card h-96 animate-pulse" />;

  const grouped: Record<AppStatus, NonNullable<typeof items>> = {
    APPLIED: [], SCREENING: [], INTERVIEW: [], OFFER: [], REJECTED: [],
  };
  for (const ja of items ?? []) grouped[ja.status].push(ja);

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
            Board{job ? ` — ${job.title}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items?.length ?? 0} application{items?.length === 1 ? "" : "s"} across the pipeline.
          </p>
        </div>
        <Link to={`/recruiter/jobs/${id}/inbox`} className="btn-secondary">
          <List size={14} />
          List view
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {APP_STATUSES.map((status) => (
          <div
            key={status}
            className={cn(
              "flex min-h-[60vh] flex-col rounded-xl border p-3",
              statusColumnTint[status],
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                <span className={cn("h-2 w-2 rounded-full", statusDotTint[status])} />
                {status}
              </div>
              <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm dark:bg-slate-950/80 dark:text-slate-300">
                {grouped[status].length}
              </span>
            </div>
            <div className="space-y-2">
              {grouped[status].map((ja) => (
                <ApplicantCard key={ja.id} ja={ja} />
              ))}
              {grouped[status].length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-2 text-center text-[11px] text-slate-400 dark:border-slate-700 dark:bg-slate-950/40">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicantCard({
  ja,
}: {
  ja: {
    id: string;
    status: AppStatus;
    createdAt: string;
    coverLetter?: string | null;
    resumeStorageKey?: string | null;
    resumeFilename?: string | null;
    resumeUrl?: string | null;
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
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/recruiter/applications/${ja.id}`}
            className="block truncate font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            {ja.applicant.name}
          </Link>
          <div className="truncate text-[11px] text-slate-500">{ja.applicant.email}</div>
        </div>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">
        Applied {new Date(ja.createdAt).toLocaleDateString()}
      </div>
      {ja.resumeStorageKey && (
        <a
          href={apiUrl(`/resumes/${ja.id}`)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
        >
          <FileText size={11} />
          CV
        </a>
      )}
      <select
        value={ja.status}
        onChange={(e) => update.mutate({ status: e.target.value as AppStatus })}
        className="input mt-2 w-full text-xs"
      >
        {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
