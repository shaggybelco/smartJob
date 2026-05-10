import {
  CheckCircle2,
  Crown,
  ShieldOff,
  Trash2,
  Users,
  ArrowDown,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import {
  useApproveMember,
  useDemoteMember,
  usePromoteMember,
  useRevokeMember,
  useTeam,
} from "../../api/team";
import type { CompanyMembership } from "@smartjob/shared";
import { cn } from "../../lib/cn";
import { formatRelative } from "../../lib/format";

const membershipPill: Record<CompanyMembership, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  APPROVED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  ADMIN: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200",
};

export function TeamPage() {
  const { user } = useAuth();
  const { data, isLoading } = useTeam();
  const approve = useApproveMember();
  const promote = usePromoteMember();
  const demote = useDemoteMember();
  const revoke = useRevokeMember();

  const isAdmin = user?.companyMembership === "ADMIN";

  if (isLoading) return <div className="card h-48 animate-pulse" />;

  const pending = (data ?? []).filter((m) => m.membership === "PENDING");
  const active = (data ?? []).filter((m) => m.membership !== "PENDING");
  const adminCount = (data ?? []).filter((m) => m.membership === "ADMIN").length;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Company
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage who at <strong>{user?.company?.name}</strong> can post jobs and review applicants.
        </p>
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold tracking-tight">
            Pending approval ({pending.length})
          </h2>
          <ul className="grid gap-2">
            {pending.map((m) => (
              <li
                key={m.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.email}</div>
                  <div className="text-[11px] text-slate-400">
                    Joined {formatRelative(m.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => approve.mutate(m.id)}
                        className="btn-primary btn-xs"
                      >
                        <CheckCircle2 size={13} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Reject ${m.name}? They'll be removed from your company.`))
                            revoke.mutate(m.id);
                        }}
                        className="btn-danger btn-xs"
                      >
                        <Trash2 size={13} />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                      Waiting for admin
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold tracking-tight">
          Active members ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Users size={24} className="text-slate-400" />
            <div className="text-sm text-slate-500">No active members yet.</div>
          </div>
        ) : (
          <ul className="grid gap-2">
            {active.map((m) => {
              const lastAdmin = m.membership === "ADMIN" && adminCount <= 1;
              return (
                <li
                  key={m.id}
                  className={cn(
                    "card flex flex-wrap items-center justify-between gap-3 p-4",
                    m.isMe && "border-brand-200",
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{m.name}</span>
                      {m.isMe && (
                        <span className="text-[11px] text-slate-400">(you)</span>
                      )}
                      <span className={cn("pill", membershipPill[m.membership])}>
                        {m.membership}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-wrap gap-2">
                      {m.membership === "APPROVED" ? (
                        <button
                          onClick={() => promote.mutate(m.id)}
                          className="btn-secondary btn-xs"
                        >
                          <Crown size={13} />
                          Make admin
                        </button>
                      ) : (
                        <button
                          onClick={() => demote.mutate(m.id)}
                          disabled={lastAdmin}
                          title={lastAdmin ? "Can't demote the last admin" : undefined}
                          className="btn-secondary btn-xs disabled:opacity-50"
                        >
                          <ArrowDown size={13} />
                          Step down
                        </button>
                      )}
                      {!m.isMe && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${m.name} from the company?`))
                              revoke.mutate(m.id);
                          }}
                          disabled={lastAdmin}
                          className="btn-danger btn-xs disabled:opacity-50"
                        >
                          <ShieldOff size={13} />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
