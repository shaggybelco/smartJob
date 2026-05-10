import { useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2, User } from "lucide-react";
import {
  useAddExperience,
  useDeleteExperience,
  useProfile,
  useSetMySkills,
  useUpdateExperience,
  useUpdateProfile,
} from "../../api/profile";
import { SkillsInput } from "../../components/SkillsInput";
import type { WorkExperience } from "@smartjob/shared";

export function ProfilePage() {
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const setSkills = useSetMySkills();

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkillsLocal] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setName(data.user.name);
      setHeadline(data.user.headline ?? "");
      setBio(data.user.bio ?? "");
      setSkillsLocal(data.skills.map((s) => s.name));
    }
  }, [data]);

  if (isLoading) return <div className="card h-48 animate-pulse" />;
  if (!data) return <div className="card p-6 text-rose-600">Couldn't load your profile.</div>;

  const skillsDirty =
    JSON.stringify([...skills].sort()) !==
    JSON.stringify(data.skills.map((s) => s.name).sort());

  const profileDirty =
    name !== data.user.name ||
    headline !== (data.user.headline ?? "") ||
    bio !== (data.user.bio ?? "");

  const saveProfile = () => updateProfile.mutate({ name, headline, bio });
  const saveSkills = () => setSkills.mutate({ skills });

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          You
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Skills here are used to recommend jobs and to show recruiters at a glance what you do.
        </p>
      </div>

      <section className="card space-y-4 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <User size={15} />
          Basics
        </div>
        <Field label="Full name">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Headline">
          <input
            className="input"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Senior Backend Engineer"
          />
        </Field>
        <Field label="Bio">
          <textarea
            rows={3}
            className="input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short summary recruiters will see."
          />
        </Field>
        <button
          onClick={saveProfile}
          disabled={!profileDirty || updateProfile.isPending}
          className="btn-primary"
        >
          {updateProfile.isPending ? "Saving…" : "Save"}
        </button>
      </section>

      <section className="card space-y-3 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Pencil size={15} />
          Skills
        </div>
        <p className="text-xs text-slate-500">
          Type a skill and press Enter. These show up to recruiters and power "Match my skills" on the job board.
        </p>
        <SkillsInput value={skills} onChange={setSkillsLocal} />
        <button
          onClick={saveSkills}
          disabled={!skillsDirty || setSkills.isPending}
          className="btn-primary"
        >
          {setSkills.isPending ? "Saving…" : "Save skills"}
        </button>
      </section>

      <ExperiencesSection experiences={data.experiences} />
    </div>
  );
}

function ExperiencesSection({ experiences }: { experiences: WorkExperience[] }) {
  const [draftOpen, setDraftOpen] = useState(false);
  const [editing, setEditing] = useState<WorkExperience | null>(null);
  const remove = useDeleteExperience();

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Briefcase size={15} />
          Work experience
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDraftOpen(true);
          }}
          className="btn-secondary btn-xs"
        >
          <Plus size={13} />
          Add
        </button>
      </div>

      {experiences.length === 0 && !draftOpen && (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No work experience yet.
        </div>
      )}

      {(draftOpen || editing) && (
        <ExperienceForm
          initial={editing}
          onClose={() => {
            setDraftOpen(false);
            setEditing(null);
          }}
        />
      )}

      <ul className="grid gap-2">
        {experiences.map((exp) => (
          <li
            key={exp.id}
            className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-medium">{exp.title}</div>
                <div className="text-xs text-slate-500">
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ""}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {formatRange(exp.startDate, exp.endDate, exp.current)}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(exp)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white dark:hover:bg-slate-800"
                  aria-label="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove experience at ${exp.company}?`))
                      remove.mutate(exp.id);
                  }}
                  className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {exp.description && (
              <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">
                {exp.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExperienceForm({
  initial,
  onClose,
}: {
  initial: WorkExperience | null;
  onClose: () => void;
}) {
  const isNew = !initial;
  const add = useAddExperience();
  const update = useUpdateExperience(initial?.id ?? "");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(
    initial?.startDate ? initial.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate ? initial.endDate.slice(0, 10) : "",
  );
  const [current, setCurrent] = useState(initial?.current ?? false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    const payload = {
      title,
      company,
      location: location || null,
      description: description || null,
      startDate: new Date(startDate).toISOString(),
      endDate: !current && endDate ? new Date(endDate).toISOString() : null,
      current,
    };
    try {
      if (isNew) await add.mutateAsync(payload);
      else await update.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-brand-200 bg-brand-50/30 p-3 dark:border-brand-900/40 dark:bg-brand-950/20">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label="Job title">
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Company">
          <input className="input" required value={company} onChange={(e) => setCompany(e.target.value)} />
        </Field>
        <Field label="Location">
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
        <Field label="Start date">
          <input
            type="date"
            className="input"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            className="input disabled:opacity-50"
            disabled={current}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={current}
            onChange={(e) => setCurrent(e.target.checked)}
            className="accent-brand-600"
          />
          Currently here
        </label>
      </div>
      <Field label="Description">
        <textarea
          rows={3}
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary btn-xs" disabled={add.isPending || update.isPending}>
          {(add.isPending || update.isPending) ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary btn-xs">
          Cancel
        </button>
      </div>
    </form>
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

function formatRange(start: string, end: string | null | undefined, current: boolean) {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;
  };
  return `${fmt(start)} → ${current ? "Present" : end ? fmt(end) : "—"}`;
}
