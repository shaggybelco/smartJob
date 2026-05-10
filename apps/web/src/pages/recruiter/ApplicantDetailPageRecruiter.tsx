import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, Mail, Briefcase } from "lucide-react";
import { useApplicant } from "../../api/applicants";
import { useStartThread } from "../../api/chat";

export function ApplicantDetailPageRecruiter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useApplicant(id);
  const startThread = useStartThread();

  if (isLoading) return <div className="card h-48 animate-pulse" />;
  if (!data) return <div className="card p-6 text-rose-600">Applicant not found.</div>;

  const initials = data.name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onMessage = async () => {
    const t = await startThread.mutateAsync(data.id);
    navigate(`/messages/${t.id}`);
  };

  return (
    <div className="space-y-5">
      <Link to="/recruiter/discover" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        Back to discover
      </Link>

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {initials || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
              {data.headline && (
                <div className="text-slate-600 dark:text-slate-300">{data.headline}</div>
              )}
              <a
                href={`mailto:${data.email}`}
                className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:underline"
              >
                <Mail size={13} />
                {data.email}
              </a>
              <div className="mt-1 text-xs text-slate-500">
                {data.yearsOfExperience} year{data.yearsOfExperience === 1 ? "" : "s"} of experience
              </div>
            </div>
          </div>
          <button onClick={onMessage} disabled={startThread.isPending} className="btn-primary">
            <MessageSquare size={14} />
            Message
          </button>
        </div>

        {data.bio && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
            {data.bio}
          </p>
        )}

        {data.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {data.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <section className="card space-y-3 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Briefcase size={15} />
          Work experience
        </div>
        {data.experiences.length === 0 ? (
          <div className="text-sm italic text-slate-400">No work experience listed.</div>
        ) : (
          <ul className="grid gap-2">
            {data.experiences.map((exp) => (
              <li key={exp.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="font-medium">{exp.title}</div>
                <div className="text-xs text-slate-500">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {fmt(exp.startDate)} → {exp.current ? "Present" : exp.endDate ? fmt(exp.endDate) : "—"}
                </div>
                {exp.description && (
                  <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">
                    {exp.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const fmt = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;
};
