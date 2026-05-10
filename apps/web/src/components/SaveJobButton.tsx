import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSaveJob, useSavedJobIds, useUnsaveJob } from "../api/savedJobs";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/cn";

export function SaveJobButton({ jobId, className }: { jobId: string; className?: string }) {
  const { user } = useAuth();
  const { data: ids } = useSavedJobIds();
  const save = useSaveJob();
  const unsave = useUnsaveJob();

  if (!user || user.role !== "APPLICANT") return null;

  const saved = ids?.includes(jobId) ?? false;
  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (saved) unsave.mutate(jobId);
        else save.mutate(jobId);
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
        saved
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
        className,
      )}
      aria-label={saved ? "Remove from saved" : "Save job"}
    >
      <Icon size={13} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
