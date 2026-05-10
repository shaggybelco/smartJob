import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../api/client";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"verifying" | "ok" | "fail">("verifying");

  useEffect(() => {
    if (!token) {
      setState("fail");
      return;
    }
    api
      .post<void>("/auth/verify-email", { token })
      .then(() => setState("ok"))
      .catch(() => setState("fail"));
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="card w-full max-w-sm p-7">
        <Link to="/" className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          <span className="text-base font-semibold tracking-tight">Smart Job</span>
        </Link>

        {state === "verifying" && (
          <p className="text-sm text-slate-500">Verifying your email…</p>
        )}
        {state === "ok" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <span className="font-medium">Email verified</span>
            </div>
            <p className="text-sm text-slate-500">You're all set.</p>
            <Link to="/login" className="btn-primary w-full">Continue</Link>
          </div>
        )}
        {state === "fail" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle size={18} />
              <span className="font-medium">Link is invalid or expired</span>
            </div>
            <p className="text-sm text-slate-500">
              You can sign in and request a new verification link from your account.
            </p>
            <Link to="/login" className="btn-secondary w-full">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
