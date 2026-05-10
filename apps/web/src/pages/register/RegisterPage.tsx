import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, User, Building2 } from "lucide-react";
import type { Role } from "@smartjob/shared";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/cn";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("APPLICANT");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        email,
        password,
        name,
        role,
        companyName: role === "RECRUITER" ? companyName : undefined,
      });
      navigate(role === "RECRUITER" ? "/recruiter/jobs" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Smart Job</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight">
            Get started in seconds.
          </h1>
          <p className="max-w-md text-sm text-white/80">
            Applicants get a job board, kanban tracker and CV upload.
            Recruiters get a posting tool and an applicant pipeline. Same login.
          </p>
        </div>
        <div className="text-xs text-white/60">© Smart Job · Demo build</div>
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <form onSubmit={onSubmit} className="card w-full max-w-md p-7">
          <h2 className="text-xl font-semibold">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">Choose how you want to use Smart Job.</p>

          {/* Role picker */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(
              [
                { value: "APPLICANT", label: "I'm an applicant", desc: "Track jobs", Icon: User },
                { value: "RECRUITER", label: "I'm a recruiter", desc: "Post + hire", Icon: Building2 },
              ] as const
            ).map(({ value, label, desc, Icon }) => (
              <label
                key={value}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 text-left transition-all",
                  role === value
                    ? "border-brand-500 bg-brand-50 shadow-ring dark:bg-brand-950/30"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon size={16} className={role === value ? "text-brand-600" : "text-slate-500"} />
                  {label}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
              </label>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
            </div>

            {role === "RECRUITER" && (
              <div className="animate-fade-in">
                <label className="label" htmlFor="company">Company name</label>
                <input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input"
                  placeholder="Acme Corp"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  We'll create the company if it doesn't exist, or link you to an existing one.
                </p>
              </div>
            )}

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
                minLength={8}
                className="input"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 8 characters.</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
            {submitting ? "Creating…" : "Create account"}
          </button>

          <div className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
