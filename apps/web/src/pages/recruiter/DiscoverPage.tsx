import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Users, MessageSquare, Eye, Wand2 } from "lucide-react";
import { useApplicantSearch } from "../../api/applicants";
import { useSkills } from "../../api/skills";
import { useStartThread } from "../../api/chat";
import { cn } from "../../lib/cn";

export function DiscoverPage() {
  const navigate = useNavigate();
  const startThread = useStartThread();
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillMatch, setSkillMatch] = useState<"any" | "all">("any");
  const [minYears, setMinYears] = useState("");

  const { data: skillCatalog } = useSkills();
  const { data, isLoading } = useApplicantSearch({
    q,
    skills,
    skillMatch,
    minYears: minYears ? Number(minYears) : undefined,
    pageSize: 50,
  });

  const toggleSkill = (slug: string) =>
    setSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const onMessage = async (applicantId: string) => {
    const t = await startThread.mutateAsync(applicantId);
    navigate(`/messages/${t.id}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Sourcing
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Discover applicants</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse profiles and start a conversation. Applicants can reply only after you
          send the first message.
        </p>
      </div>

      <div className="card space-y-3 p-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, headline, bio…"
            className="input pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="label flex items-center justify-between">
              <span>Required skills</span>
              <div className="flex gap-1 text-[10px]">
                {(["any", "all"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSkillMatch(m)}
                    className={cn(
                      "rounded-full px-2 py-0.5 font-medium uppercase",
                      skillMatch === m
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skillCatalog?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSkill(s.slug)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    skills.includes(s.slug)
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="minYears">Min years</label>
            <input
              id="minYears"
              type="number"
              min={0}
              value={minYears}
              onChange={(e) => setMinYears(e.target.value)}
              className="input w-28"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !data || data.items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Users size={28} className="text-slate-400" />
          <div className="text-sm text-slate-500">No applicants match these filters.</div>
        </div>
      ) : (
        <ul className="grid gap-3">
          {data.items.map((a) => (
            <li key={a.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {a.name
                      .split(/\s+/)
                      .map((p) => p[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold tracking-tight">{a.name}</div>
                    {a.headline && (
                      <div className="text-sm text-slate-600 dark:text-slate-300">{a.headline}</div>
                    )}
                    <div className="mt-1 text-xs text-slate-500">
                      {a.yearsOfExperience} year{a.yearsOfExperience === 1 ? "" : "s"} of experience
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/recruiter/applicants/${a.id}`} className="btn-secondary btn-xs">
                    <Eye size={13} />
                    View profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => onMessage(a.id)}
                    disabled={startThread.isPending}
                    className="btn-primary btn-xs"
                  >
                    <MessageSquare size={13} />
                    Message
                  </button>
                </div>
              </div>
              {a.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {a.skills.map((s) => {
                    const matched = skills.includes(s.slug);
                    return (
                      <span
                        key={s.id}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          matched
                            ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                        )}
                      >
                        {matched && <Wand2 size={9} className="mr-0.5 inline" />}
                        {s.name}
                      </span>
                    );
                  })}
                </div>
              )}
              {a.bio && (
                <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {a.bio}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
