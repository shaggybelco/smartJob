import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, X, Archive, ArchiveRestore, FileText, Image as ImageIcon } from "lucide-react";
import {
  reportTyping,
  useArchiveThread,
  useMarkThreadRead,
  useSendMessage,
  useThread,
} from "../../api/chat";
import { subscribeRealtime } from "../../api/realtime";
import { apiUrl } from "../../api/client";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/cn";
import { formatRelative } from "../../lib/format";

const TYPING_TTL = 5000;

export function MessageThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading } = useThread(id);
  const sendMessage = useSendMessage(id ?? "");
  const archive = useArchiveThread(id ?? "");
  const markRead = useMarkThreadRead(id ?? "");

  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [otherTypingUntil, setOtherTypingUntil] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark as read on mount
  useEffect(() => {
    if (id) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [data?.messages.length]);

  // Listen for typing events on this thread
  useEffect(() => {
    if (!id || !user) return;
    return subscribeRealtime((ev) => {
      if (ev.type === "chat.typing" && ev.threadId === id && ev.userId !== user.id) {
        setOtherTypingUntil(new Date(ev.expiresAt).getTime());
      }
    });
  }, [id, user]);

  // Tick to expire typing indicator
  useEffect(() => {
    if (!otherTypingUntil) return;
    const timeout = otherTypingUntil - Date.now();
    if (timeout <= 0) {
      setOtherTypingUntil(null);
      return;
    }
    const t = setTimeout(() => setOtherTypingUntil(null), timeout);
    return () => clearTimeout(t);
  }, [otherTypingUntil]);

  const otherTyping = otherTypingUntil != null && otherTypingUntil > Date.now();

  const groupedMessages = useMemo(() => data?.messages ?? [], [data]);

  if (isLoading) return <div className="card h-96 animate-pulse" />;
  if (!data) return <div className="card p-6 text-rose-600">Thread not found.</div>;

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() && attachments.length === 0) return;
    if (!data.canReply) return;
    await sendMessage.mutateAsync({ body, attachments });
    setBody("");
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onTyping = () => {
    if (!id) return;
    void reportTyping(id);
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    if (list.length === 0) return;
    setAttachments((prev) => [...prev, ...list].slice(0, 5));
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/messages" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
          <ArrowLeft size={14} />
          Inbox
        </Link>
        <button
          type="button"
          onClick={() => archive.mutate(!data.archived)}
          className="btn-secondary btn-xs"
        >
          {data.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          {data.archived ? "Unarchive" : "Archive"}
        </button>
      </div>

      <header className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {data.otherParty.name
              .split(/\s+/)
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{data.otherParty.name}</div>
            <div className="text-xs text-slate-500">
              {data.otherParty.headline}
              {data.otherParty.companyName ? ` · ${data.otherParty.companyName}` : ""}
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="card flex-1 space-y-3 overflow-y-auto p-4">
        {groupedMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No messages yet.
          </div>
        ) : (
          groupedMessages.map((m) => {
            const mine = m.senderId === user?.id;
            return (
              <div
                key={m.id}
                id={`msg-${m.id}`}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    mine
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
                  )}
                >
                  {m.body && <div className="whitespace-pre-wrap">{m.body}</div>}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className={cn("mt-2 flex flex-col gap-1.5", mine && "items-end")}>
                      {m.attachments.map((a) => (
                        <Attachment key={a.id} att={a} mine={mine} />
                      ))}
                    </div>
                  )}
                  <div className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-slate-500")}>
                    {formatRelative(m.createdAt)}
                    {mine && m.readAt && " · Read"}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs italic text-slate-500 dark:bg-slate-800">
              {data.otherParty.name} is typing…
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSend} className="card p-3">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((f, i) => (
              <span
                key={`${f.name}-${i}`}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                {f.type.startsWith("image/") ? <ImageIcon size={11} /> : <FileText size={11} />}
                <span className="max-w-[160px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        {!data.canReply && (
          <div className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Wait for the recruiter to send you a message before replying.
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!data.canReply}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
            aria-label="Attach files"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={onPickFiles}
            className="sr-only"
            accept=".pdf,.doc,.docx,.txt,image/*"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={onTyping}
            disabled={!data.canReply}
            rows={2}
            placeholder={data.canReply ? "Type a message…" : "Locked until the recruiter messages you"}
            className="input flex-1 resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!data.canReply || sendMessage.isPending || (!body.trim() && attachments.length === 0)}
            className="btn-primary"
            aria-label="Send"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Attachment({
  att,
  mine,
}: {
  att: { id: string; filename: string; mimeType: string; size: number };
  mine: boolean;
}) {
  const url = apiUrl(`/chat/attachments/${att.id}`);
  const isImage = att.mimeType.startsWith("image/");
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={att.filename} className="max-h-48 max-w-[240px] rounded-md object-cover" />
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium underline-offset-2 hover:underline",
        mine
          ? "bg-white/20 text-white"
          : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200",
      )}
    >
      <FileText size={11} />
      {att.filename} · {(att.size / 1024).toFixed(0)} KB
    </a>
  );
}
