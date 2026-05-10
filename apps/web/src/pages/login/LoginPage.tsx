import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../lib/auth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@smartjob.local");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Smart Job</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight">
            Track every application.<br />Land every interview.
          </h1>
          <p className="max-w-md text-sm text-white/80">
            One place for applicants and recruiters — kanban tracking, job board,
            and a clean apply flow with CV upload.
          </p>
        </div>
        <div className="text-xs text-white/60">
          Demo:&nbsp;<code className="rounded bg-white/10 px-1.5 py-0.5">demo@smartjob.local</code>
          &nbsp;/&nbsp;<code className="rounded bg-white/10 px-1.5 py-0.5">demo1234</code>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <form onSubmit={onSubmit} className="card w-full max-w-sm p-7">
          <h2 className="text-xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your Smart Job account.</p>

          <div className="mt-6 space-y-4">
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
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <div className="mt-4 text-center text-sm text-slate-500">
            No account?{" "}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">
              Create one
            </Link>
          </div>
          <div className="mt-2 text-center text-xs text-slate-500">
            <Link to="/reset-password" className="hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="mt-3 text-center text-xs text-slate-400">
            <Link to="/jobs" className="hover:underline">
              Or browse jobs without an account →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
