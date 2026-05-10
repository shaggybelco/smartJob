import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { api, ApiError } from "../../api/client";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<void>("/auth/request-password-reset", { email });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<void>("/auth/reset-password", { token, password });
      navigate("/login");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="card w-full max-w-sm p-7">
        <Link to="/" className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          <span className="text-base font-semibold tracking-tight">Smart Job</span>
        </Link>

        {!token ? (
          <>
            <h1 className="text-xl font-semibold">Reset password</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we'll send a reset link.
            </p>
            {done ? (
              <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                Check your inbox for a link to reset your password.
              </div>
            ) : (
              <form onSubmit={onRequest} className="mt-5 space-y-4">
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                {error && (
                  <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {error}
                  </div>
                )}
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? "Sending…" : "Send reset link"}
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Choose a new password</h1>
            <form onSubmit={onReset} className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="password">New password (min 8)</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="input"
                  required
                />
              </div>
              {error && (
                <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              )}
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}

        <div className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="text-brand-600 hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
