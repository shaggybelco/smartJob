import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Inbox, Search, Archive } from "lucide-react";
import { useThreads, useChatSearch } from "../../api/chat";
import { formatRelative } from "../../lib/format";
import { cn } from "../../lib/cn";

export function MessagesListPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "archived" ? "archived" : "active";
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);

  const { data: threads, isLoading } = useThreads(tab === "archived");
  const { data: searchResults } = useChatSearch(q);

  const showSearch = q.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Inbox
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Conversations between you and recruiters / applicants. Recruiters start the
          conversation; replies go either way.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) setParams({ q: draft.trim() });
          else {
            params.delete("q");
            setParams(params);
          }
        }}
        className="card flex gap-2 p-3"
      >
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search messages…"
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
        {q && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              params.delete("q");
              setParams(params);
            }}
            className="btn-ghost"
          >
            Clear
          </button>
        )}
      </form>

      {!showSearch && (
        <div className="flex gap-1.5">
          {(["active", "archived"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === "archived") setParams({ tab: "archived" });
                else setParams({});
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                tab === t
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
              )}
            >
              {t === "active" ? "Active" : "Archived"}
            </button>
          ))}
        </div>
      )}

      {showSearch ? (
        <ul className="grid gap-2">
          {(searchResults?.items ?? []).map((r) => (
            <li key={r.messageId}>
              <Link
                to={`/messages/${r.threadId}#msg-${r.messageId}`}
                className="card card-hover block p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.otherParty.name}</div>
                  <div className="text-xs text-slate-400">{formatRelative(r.createdAt)}</div>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.snippet}</p>
              </Link>
            </li>
          ))}
          {searchResults?.items.length === 0 && (
            <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
              <Search size={26} className="text-slate-400" />
              <div className="text-sm text-slate-500">No messages match "{q}".</div>
            </div>
          )}
        </ul>
      ) : isLoading ? (
        <div className="card h-48 animate-pulse" />
      ) : !threads || threads.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          {tab === "archived" ? <Archive size={26} className="text-slate-400" /> : <Inbox size={26} className="text-slate-400" />}
          <div className="text-sm text-slate-500">
            {tab === "archived"
              ? "No archived conversations."
              : "No conversations yet. Recruiters will reach out here if they're interested."}
          </div>
        </div>
      ) : (
        <ul className="grid gap-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link to={`/messages/${t.id}`} className="card card-hover block p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {t.otherParty.name
                        .split(/\s+/)
                        .map((p) => p[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t.otherParty.name}</span>
                        {t.otherParty.companyName && (
                          <span className="text-xs text-slate-500">@ {t.otherParty.companyName}</span>
                        )}
                      </div>
                      {t.otherParty.headline && (
                        <div className="text-xs text-slate-500">{t.otherParty.headline}</div>
                      )}
                      {t.lastMessage && (
                        <div className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{t.lastMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    {t.lastMessageAt && (
                      <span className="text-[11px] text-slate-400">{formatRelative(t.lastMessageAt)}</span>
                    )}
                    {t.unreadCount > 0 && (
                      <span className="pill bg-brand-600 text-white">{t.unreadCount}</span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
