import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, List, FileText } from "lucide-react";
import { PIPELINE_STATUSES, type AppStatus, type JobApplication } from "@smartjob/shared";
import { useJob, useJobInbox, jobKeys } from "../../api/jobs";
import { useUpdateJobApplication } from "../../api/jobApplications";
import { api, apiUrl } from "../../api/client";
import { statusColumnTint, statusDotTint } from "../../components/StatusBadge";
import { cn } from "../../lib/cn";

type InboxItem = NonNullable<ReturnType<typeof useJobInbox>["data"]>[number];

export function RecruiterJobBoardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job } = useJob(id);
  const { data: items, isLoading } = useJobInbox(id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const qc = useQueryClient();

  const move = useMutation({
    mutationFn: ({ jobAppId, status }: { jobAppId: string; status: AppStatus }) =>
      api.patch<JobApplication>(`/job-applications/${jobAppId}`, { status }),
    onMutate: async ({ jobAppId, status }) => {
      if (!id) return;
      const key = jobKeys.inbox(id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<InboxItem[]>(key);
      qc.setQueryData<InboxItem[]>(key, (old) =>
        old ? old.map((ja) => (ja.id === jobAppId ? { ...ja, status } : ja)) : old,
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && id) qc.setQueryData(jobKeys.inbox(id), ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["jobApplications"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (isLoading) return <div className="card h-96 animate-pulse" />;

  const grouped: Record<AppStatus, InboxItem[]> = {
    APPLIED: [], SCREENING: [], INTERVIEW: [], OFFER: [], REJECTED: [], WITHDRAWN: [],
  };
  for (const ja of items ?? []) grouped[ja.status].push(ja);

  const active = activeId ? (items ?? []).find((i) => i.id === activeId) : null;

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const dropTarget = e.over?.id as AppStatus | undefined;
    const ja = (items ?? []).find((x) => x.id === e.active.id);
    if (!ja || !dropTarget || ja.status === dropTarget) return;
    move.mutate({ jobAppId: ja.id, status: dropTarget });
  };

  return (
    <div className="space-y-5">
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        My jobs
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Pipeline
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Board{job ? ` — ${job.title}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items?.length ?? 0} application{items?.length === 1 ? "" : "s"}. Drag cards to move.
          </p>
        </div>
        <Link to={`/recruiter/jobs/${id}/inbox`} className="btn-secondary">
          <List size={14} />
          List view
        </Link>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {PIPELINE_STATUSES.map((status) => (
            <Column key={status} status={status} items={grouped[status]} />
          ))}
        </div>
        <DragOverlay>{active ? <ApplicantCard ja={active} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ status, items }: { status: AppStatus; items: InboxItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[60vh] flex-col rounded-xl border p-3 transition-colors",
        statusColumnTint[status],
        isOver && "ring-2 ring-brand-400",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          <span className={cn("h-2 w-2 rounded-full", statusDotTint[status])} />
          {status}
        </div>
        <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm dark:bg-slate-950/80 dark:text-slate-300">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((ja) => (
          <Draggable key={ja.id} ja={ja} />
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-2 text-center text-[11px] text-slate-400 dark:border-slate-700 dark:bg-slate-950/40">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function Draggable({ ja }: { ja: InboxItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: ja.id });
  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0 : 1 }} {...listeners} {...attributes}>
      <ApplicantCard ja={ja} />
    </div>
  );
}

function ApplicantCard({ ja, dragging }: { ja: InboxItem; dragging?: boolean }) {
  const update = useUpdateJobApplication(ja.id);
  const initials = ja.applicant.name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-2.5 text-sm shadow-sm transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing dark:border-slate-800 dark:bg-slate-950",
        dragging && "ring-2 ring-brand-400",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/recruiter/applications/${ja.id}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="block truncate font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            {ja.applicant.name}
          </Link>
          <div className="truncate text-[11px] text-slate-500">{ja.applicant.email}</div>
        </div>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">
        Applied {new Date(ja.createdAt).toLocaleDateString()}
      </div>
      {ja.resumeStorageKey && (
        <a
          href={apiUrl(`/resumes/${ja.id}`)}
          target="_blank"
          rel="noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
        >
          <FileText size={11} />
          CV
        </a>
      )}
      <select
        value={ja.status}
        onChange={(e) => update.mutate({ status: e.target.value as AppStatus })}
        onPointerDown={(e) => e.stopPropagation()}
        className="input mt-2 w-full text-xs"
      >
        {([...PIPELINE_STATUSES, "WITHDRAWN"] as AppStatus[]).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
