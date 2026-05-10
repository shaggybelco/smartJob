import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users, Inbox } from "lucide-react";
import { useTeamThread, useTeamThreads } from "../../api/chat";
import { formatRelative } from "../../lib/format";

export function TeamThreadsPage() {
  const { data, isLoading } = useTeamThreads();

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Team
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Team threads</h1>
        <p className="mt-1 text-sm text-slate-500">
          All conversations between recruiters at your company and applicants. Read-only.
        </p>
      </div>

      {isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !data || data.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Inbox size={26} className="text-slate-400" />
          <div className="text-sm text-slate-500">No team conversations yet.</div>
        </div>
      ) : (
        <ul className="grid gap-2">
          {data.map((t) => (
            <li key={t.id}>
              <Link to={`/recruiter/team/threads/${t.id}`} className="card card-hover block p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {t.otherParty.name
                        .split(/\s+/)
                        .map((p) => p[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{t.otherParty.name}</div>
                      {t.ownerRecruiterName && (
                        <div className="text-xs text-slate-500">
                          Owned by {t.ownerRecruiterName}
                        </div>
                      )}
                      {t.lastMessage && (
                        <div className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{t.lastMessage}</div>
                      )}
                    </div>
                  </div>
                  {t.lastMessageAt && (
                    <span className="text-[11px] text-slate-400">{formatRelative(t.lastMessageAt)}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TeamThreadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useTeamThread(id);

  if (isLoading) return <div className="card h-96 animate-pulse" />;
  if (!data) return <div className="card p-6 text-rose-600">Thread not found.</div>;

  return (
    <div className="space-y-4">
      <Link to="/recruiter/team/threads" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        Team threads
      </Link>
      <div className="card flex items-center gap-3 p-4">
        <Users size={16} className="text-slate-400" />
        <div>
          <div className="font-medium">{data.otherParty.name}</div>
          {data.otherParty.headline && (
            <div className="text-xs text-slate-500">{data.otherParty.headline}</div>
          )}
        </div>
      </div>
      <div className="card space-y-3 p-4">
        {data.messages.length === 0 ? (
          <div className="text-sm text-slate-500">No messages yet.</div>
        ) : (
          data.messages.map((m) => {
            const isApplicant = m.senderId === data.otherParty.id;
            return (
              <div key={m.id} className={isApplicant ? "flex justify-start" : "flex justify-end"}>
                <div
                  className={
                    isApplicant
                      ? "max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2 text-sm shadow-sm dark:bg-slate-800"
                      : "max-w-[80%] rounded-2xl bg-brand-600 px-3 py-2 text-sm text-white shadow-sm"
                  }
                >
                  <div className="whitespace-pre-wrap">{m.body}</div>
                  <div className="mt-1 text-[10px] opacity-70">{formatRelative(m.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <p className="text-center text-xs text-slate-400">Read-only team view.</p>
    </div>
  );
}
