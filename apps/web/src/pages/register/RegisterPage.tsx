import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, User, Building2, Search, Plus, Check } from "lucide-react";
import type { Role } from "@smartjob/shared";
import { useAuth } from "../../lib/auth";
import { useCompanySearch, type CompanySearchResult } from "../../api/companies";
import { cn } from "../../lib/cn";

type CompanyChoice =
  | { kind: "existing"; id: string; name: string }
  | { kind: "new"; name: string }
  | null;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("APPLICANT");
  const [companyQuery, setCompanyQuery] = useState("");
  const [company, setCompany] = useState<CompanyChoice>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const debounced = useDebounced(companyQuery, 200);
  const { data: results } = useCompanySearch(debounced);

  const exactMatch = useMemo(
    () =>
      results?.find(
        (c) => c.name.toLowerCase() === companyQuery.trim().toLowerCase(),
      ),
    [results, companyQuery],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === "RECRUITER" && !company) {
      setError("Pick an existing company or add a new one.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email,
        password,
        name,
        role,
        companyId:
          role === "RECRUITER" && company?.kind === "existing" ? company.id : undefined,
        companyName:
          role === "RECRUITER" && company?.kind === "new" ? company.name : undefined,
      });
      navigate(role === "RECRUITER" ? "/recruiter/inbox" : "/dashboard");
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
            The first recruiter to register for a company becomes its admin. Anyone joining
            an existing company is approved by an admin first.
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
                  onChange={() => {
                    setRole(value);
                    setCompany(null);
                  }}
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
                <span className="label">Company</span>
                {company ? (
                  <SelectedCompanyChip
                    company={company}
                    onChange={() => {
                      setCompany(null);
                      setCompanyQuery("");
                    }}
                  />
                ) : (
                  <CompanyPicker
                    query={companyQuery}
                    onQueryChange={setCompanyQuery}
                    results={results}
                    onPickExisting={(c) =>
                      setCompany({ kind: "existing", id: c.id, name: c.name })
                    }
                    onCreateNew={(n) => setCompany({ kind: "new", name: n })}
                    exactMatch={exactMatch}
                  />
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {company?.kind === "new"
                    ? "You'll be the first admin of this company."
                    : company?.kind === "existing"
                      ? "Your account will need approval from a company admin."
                      : "Search for your company. If it doesn't exist yet, add it — you'll be the admin."}
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

function CompanyPicker({
  query,
  onQueryChange,
  results,
  onPickExisting,
  onCreateNew,
  exactMatch,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  results: CompanySearchResult[] | undefined;
  onPickExisting: (c: CompanySearchResult) => void;
  onCreateNew: (name: string) => void;
  exactMatch: CompanySearchResult | undefined;
}) {
  const trimmed = query.trim();
  const showCreate = trimmed.length > 0 && !exactMatch;

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search company name"
          className="input pl-9"
        />
      </div>
      {(results && results.length > 0) || showCreate ? (
        <div className="mt-1 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
          {results?.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPickExisting(r)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span>{r.name}</span>
              <span className="text-xs text-slate-400">Existing</span>
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              onClick={() => onCreateNew(trimmed)}
              className="flex w-full items-center gap-2 border-t border-slate-100 bg-brand-50/40 px-3 py-2 text-left text-sm text-brand-700 hover:bg-brand-50 dark:border-slate-800 dark:bg-brand-950/30 dark:text-brand-200"
            >
              <Plus size={13} />
              Add "<span className="font-medium">{trimmed}</span>" as a new company
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SelectedCompanyChip({
  company,
  onChange,
}: {
  company: NonNullable<CompanyChoice>;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm dark:border-brand-900/40 dark:bg-brand-950/30">
      <div className="flex items-center gap-2">
        <Check size={14} className="text-brand-600" />
        <span className="font-medium">{company.name}</span>
        <span className="text-xs text-slate-500">
          {company.kind === "new" ? "(new company)" : "(existing)"}
        </span>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="text-xs text-slate-500 hover:underline"
      >
        Change
      </button>
    </div>
  );
}

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
