import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import { useCreateJob, useJob, useUpdateJob } from "../../api/jobs";
import { SkillsInput } from "../../components/SkillsInput";

interface QuestionDraft {
  prompt: string;
  required: boolean;
}

export function JobEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { data: existing } = useJob(id);
  const create = useCreateJob();
  const update = useUpdateJob(id ?? "");

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    remote: false,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  useEffect(() => {
    if (existing && !isNew) {
      setForm({
        title: existing.title,
        description: existing.description,
        location: existing.location ?? "",
        salaryMin: existing.salaryMin?.toString() ?? "",
        salaryMax: existing.salaryMax?.toString() ?? "",
        remote: existing.remote ?? false,
      });
      setSkills(existing.skills?.map((s) => s.name) ?? []);
      setQuestions(
        (existing.questions ?? []).map((q) => ({ prompt: q.prompt, required: q.required })),
      );
    }
  }, [existing, isNew]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location || null,
      remote: form.remote,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      skills,
      questions: questions
        .filter((q) => q.prompt.trim())
        .map((q, i) => ({ prompt: q.prompt, required: q.required, position: i })),
    };
    if (isNew) await create.mutateAsync(payload);
    else await update.mutateAsync(payload);
    navigate("/recruiter/jobs");
  };

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-2xl space-y-5">
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        My jobs
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isNew ? "Post a job" : "Edit job"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Salaries are in ZAR, annual.</p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-5">
        <Field label="Title">
          <input className="input" required value={form.title} onChange={set("title")} placeholder="Senior Backend Engineer" />
        </Field>
        <Field label="Description">
          <textarea
            rows={8}
            className="input"
            required
            value={form.description}
            onChange={set("description")}
            placeholder="What you'll do, the stack, what you're looking for…"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Location">
            <input className="input" value={form.location} onChange={set("location")} placeholder="Cape Town" />
          </Field>
          <Field label="Salary min (ZAR)">
            <input type="number" className="input" value={form.salaryMin} onChange={set("salaryMin")} />
          </Field>
          <Field label="Salary max (ZAR)">
            <input type="number" className="input" value={form.salaryMax} onChange={set("salaryMax")} />
          </Field>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.remote}
            onChange={(e) => setForm((f) => ({ ...f, remote: e.target.checked }))}
            className="accent-brand-600"
          />
          Remote-friendly
        </label>

        <Field label="Skills">
          <SkillsInput value={skills} onChange={setSkills} />
        </Field>

        <Field label="Application questions (optional)">
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                <GripVertical size={14} className="mt-2 text-slate-400" />
                <div className="flex-1 space-y-1.5">
                  <input
                    className="input"
                    placeholder="What's your notice period?"
                    value={q.prompt}
                    onChange={(e) =>
                      setQuestions((prev) => prev.map((p, idx) => (idx === i ? { ...p, prompt: e.target.value } : p)))
                    }
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((p, idx) => (idx === i ? { ...p, required: e.target.checked } : p)),
                        )
                      }
                      className="accent-brand-600"
                    />
                    Required
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setQuestions((prev) => [...prev, { prompt: "", required: false }])}
              className="btn-secondary btn-xs"
            >
              <Plus size={13} />
              Add question
            </button>
          </div>
        </Field>

        {(create.error || update.error) && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {(create.error ?? update.error) instanceof Error
              ? (create.error ?? update.error)!.message
              : "Failed to save"}
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={create.isPending || update.isPending} className="btn-primary">
            {create.isPending || update.isPending ? "Saving…" : "Save"}
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
