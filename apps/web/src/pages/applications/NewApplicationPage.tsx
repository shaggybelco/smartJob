import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold">New application</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company"><input className={inputCls} required {...field("company")} /></Field>
          <Field label="Role"><input className={inputCls} required {...field("role")} /></Field>
          <Field label="Status">
            <select className={inputCls} {...field("status")}>
              {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Source"><input className={inputCls} {...field("source")} /></Field>
          <Field label="Salary"><input className={inputCls} type="number" {...field("salary")} /></Field>
          <Field label="Location"><input className={inputCls} {...field("location")} /></Field>
        </div>
        <Field label="Job URL"><input className={inputCls} type="url" {...field("jobUrl")} /></Field>
        <Field label="Notes"><textarea rows={4} className={inputCls} {...field("notes")} /></Field>

        {create.error && (
          <div className="text-sm text-rose-600">
            {create.error instanceof Error ? create.error.message : "Failed to save"}
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {create.isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
