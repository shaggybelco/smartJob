import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import {
  useJobApplicationDetail,
  useUpdateJobApplication,
} from "../../api/jobApplications";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { StatusBadge } from "../../components/StatusBadge";
import { apiUrl } from "../../api/client";

export function RecruiterApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useJobApplicationDetail(id);
  const update = useUpdateJobApplication(id ?? "");

  if (isLoading) return <div className="card h-48 animate-pulse" />;
  if (!data) return <div className="card p-6 text-rose-600">Not found.</div>;

  const initials = data.applicant.name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-5">
      <Link
        to={`/recruiter/jobs/${data.job.id}/inbox`}
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
      >
        <ArrowLeft size={14} />
        Back to inbox
      </Link>

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {initials || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{data.applicant.name}</h1>
              <a
                href={`mailto:${data.applicant.email}`}
                className="mt-0.5 inline-flex items-center gap-1 text-sm text-slate-500 hover:underline"
              >
                <Mail size={13} />
                {data.applicant.email}
              </a>
              <div className="mt-1 text-xs text-slate-500">
                Applied for{" "}
                <Link to={`/jobs/${data.job.id}`} className="text-brand-600 hover:underline">
                  {data.job.title}
                </Link>{" "}
                at {data.job.company.name} · {new Date(data.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={data.status} />
            <select
              value={data.status}
              onChange={(e) => update.mutate({ status: e.target.value as AppStatus })}
              className="input w-auto"
            >
              {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <section className="card p-5">
        <div className="label">Cover letter</div>
        {data.coverLetter ? (
          <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
            {data.coverLetter}
          </div>
        ) : (
          <div className="mt-1 text-sm italic text-slate-400">No cover letter provided</div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {data.resumeStorageKey && (
          <a
            href={apiUrl(`/resumes/${data.id}`)}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <FileText size={14} />
            Download CV ({data.resumeFilename ?? "file"})
          </a>
        )}
        {data.resumeUrl && (
          <a
            href={data.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            Resume URL ↗
          </a>
        )}
      </div>

      <section className="card p-5">
        <div className="label">Recruiter note (private)</div>
        <textarea
          defaultValue={data.recruiterNote ?? ""}
          rows={4}
          onBlur={(e) => update.mutate({ recruiterNote: e.target.value || null })}
          className="input mt-1"
          placeholder="Notes only your team will see…"
        />
      </section>
    </div>
  );
}
