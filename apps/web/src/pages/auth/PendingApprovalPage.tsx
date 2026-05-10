import { Sparkles, Hourglass } from "lucide-react";
import { useAuth } from "../../lib/auth";

export function PendingApprovalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Hourglass size={22} />
        </div>
        <h1 className="text-xl font-semibold">Awaiting approval</h1>
        <p className="mt-2 text-sm text-slate-500">
          You've joined <strong>{user?.company?.name ?? "the company"}</strong>. An existing
          admin needs to approve your account before you can post jobs or view applicants.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Hang tight — we'll show your dashboard the moment you're approved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <Sparkles size={13} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-medium">Smart Job</span>
        </div>
        <button onClick={() => void logout()} className="btn-ghost mt-4 w-full justify-center">
          Sign out
        </button>
      </div>
    </div>
  );
}
