import type {
  ChatMessageDto,
  ChatSearchResult,
  ChatThreadDetail,
  ChatThreadSummary,
} from "@smartjob/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

const chatKeys = {
  threads: (archived: boolean) => ["chat", "threads", archived] as const,
  thread: (id: string) => ["chat", "thread", id] as const,
  unreadCount: ["chat", "unread"] as const,
  search: (q: string) => ["chat", "search", q] as const,
  team: ["chat", "team"] as const,
  teamThread: (id: string) => ["chat", "team", id] as const,
};

export const useThreads = (archived = false) =>
  useQuery({
    queryKey: chatKeys.threads(archived),
    queryFn: () =>
      api.get<ChatThreadSummary[]>(`/chat/threads${archived ? "?archived=true" : ""}`),
  });

export const useThread = (id: string | undefined) =>
  useQuery({
    queryKey: id ? chatKeys.thread(id) : ["chat", "thread", "noop"],
    queryFn: () => api.get<ChatThreadDetail>(`/chat/threads/${id}`),
    enabled: !!id,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: chatKeys.unreadCount,
    queryFn: () => api.get<{ unread: number }>("/chat/unread-count"),
    refetchInterval: 60_000,
  });

export const useStartThread = () =>
  useMutation({
    mutationFn: (applicantId: string) =>
      api.post<{ id: string }>("/chat/threads", { applicantId }),
  });

export const useSendMessage = (threadId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      attachments,
    }: {
      body: string;
      attachments: File[];
    }) => {
      const form = new FormData();
      if (body.trim()) form.append("body", body.trim());
      for (const f of attachments) form.append("attachments", f);
      return api.postForm<ChatMessageDto>(`/chat/threads/${threadId}/messages`, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat"] });
    },
  });
};

export const useMarkThreadRead = (threadId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>(`/chat/threads/${threadId}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.unreadCount });
      qc.invalidateQueries({ queryKey: chatKeys.thread(threadId) });
    },
  });
};

export const useArchiveThread = (threadId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (archive: boolean) =>
      api.post<void>(
        `/chat/threads/${threadId}/${archive ? "archive" : "unarchive"}`,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat"] }),
  });
};

export const useChatSearch = (q: string) =>
  useQuery({
    queryKey: chatKeys.search(q),
    queryFn: () =>
      api.get<{ items: ChatSearchResult[] }>(
        `/chat/search?q=${encodeURIComponent(q)}`,
      ),
    enabled: q.length > 0,
  });

export const useTeamThreads = () =>
  useQuery({
    queryKey: chatKeys.team,
    queryFn: () => api.get<ChatThreadSummary[]>("/recruiter/team/threads"),
  });

export const useTeamThread = (id: string | undefined) =>
  useQuery({
    queryKey: id ? chatKeys.teamThread(id) : ["chat", "team", "noop"],
    queryFn: () => api.get<ChatThreadDetail>(`/recruiter/team/threads/${id}`),
    enabled: !!id,
  });

export const reportTyping = (threadId: string) =>
  api.post<void>(`/chat/threads/${threadId}/typing`).catch(() => undefined);
