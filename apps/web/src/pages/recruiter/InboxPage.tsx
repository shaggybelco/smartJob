import { useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, FileText, MapPin } from "lucide-react";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import {
  useRecruiterInbox,
  useUpdateJobApplication,
} from "../../api/jobApplications";
import { StatusBadge } from "../../components/StatusBadge";
import { apiUrl } from "../../api/client";
import { formatRelative } from "../../lib/format";
import { cn } from "../../lib/cn";

/**
 * Recruiter cross-job inbox: every application across every job at the
 * recruiter's company, ordered by most recent activity.
 */
export function RecruiterInboxPage() {
  const [filter, setFilter] = useState<AppStatus | "ALL">("ALL");
  const { data: items, isLoading } = useRecruiterInbox(
    filter === "ALL" ? undefined : filter,
  );

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Pipeline
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Inbox</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every applicant across all your company's jobs, latest activity first.
        </p>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label="All"
        />
        {APP_STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={s}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !items || items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Inbox size={28} className="text-slate-400" />
          <div className="text-sm text-slate-500">
            {filter === "ALL"
              ? "No applications yet."
              : `No applicants currently in ${filter}.`}
          </div>
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

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
      )}
    >
      {label}
    </button>
  );
}

function InboxRow({
  ja,
}: {
  ja: {
    id: string;
    status: AppStatus;
    coverLetter?: string | null;
    resumeStorageKey?: string | null;
    resumeFilename?: string | null;
    resumeUrl?: string | null;
    recruiterNote?: string | null;
    createdAt: string;
    updatedAt: string;
    applicant: { id: string; name: string; email: string };
    job: {
      id: string;
      title: string;
      location: string | null;
      company: { id: string; name: string };
    };
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
              className="block truncate font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              {ja.applicant.name}
            </Link>
            <div className="truncate text-xs text-slate-500">{ja.applicant.email}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium">
                <Link
                  to={`/recruiter/jobs/${ja.job.id}/inbox`}
                  className="hover:underline"
                >
                  {ja.job.title}
                </Link>
              </span>
              {ja.job.location && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <MapPin size={11} />
                  {ja.job.location}
                </span>
              )}
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{formatRelative(ja.updatedAt)}</span>
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
            {APP_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Link to={`/recruiter/applications/${ja.id}`} className="btn-secondary btn-xs">
            View
          </Link>
        </div>
      </div>

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
    </li>
  );
}
