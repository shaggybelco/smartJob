import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";
import { useCreateApplication } from "../../api/applications";

export function NewApplicationPage() {
  const navigate = useNavigate();
  const create = useCreateApplication();
  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "APPLIED" as AppStatus,
    source: "",
    salary: "",
    jobUrl: "",
    location: "",
    notes: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      company: form.company,
      role: form.role,
      status: form.status,
      source: form.source || null,
      salary: form.salary ? Number(form.salary) : null,
      jobUrl: form.jobUrl || null,
      location: form.location || null,
      notes: form.notes || null,
    });
    navigate("/applications");
  };

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <div className="max-w-2xl space-y-5">
      <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        Back
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New application</h1>
        <p className="mt-1 text-sm text-slate-500">Track a job you've applied to off the platform.</p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company"><input className="input" required {...field("company")} /></Field>
          <Field label="Role"><input className="input" required {...field("role")} /></Field>
          <Field label="Status">
            <select className="input" {...field("status")}>
              {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Source"><input className="input" placeholder="LinkedIn, referral…" {...field("source")} /></Field>
          <Field label="Salary (ZAR)"><input className="input" type="number" {...field("salary")} /></Field>
          <Field label="Location"><input className="input" {...field("location")} /></Field>
        </div>
        <Field label="Job URL"><input className="input" type="url" {...field("jobUrl")} /></Field>
        <Field label="Notes"><textarea rows={4} className="input" {...field("notes")} /></Field>

        {create.error && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {create.error instanceof Error ? create.error.message : "Failed to save"}
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={create.isPending} className="btn-primary">
            {create.isPending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
