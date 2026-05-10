import path from "node:path";
import fs from "node:fs";
import type { ChatSearchQuery, ChatThreadSummary } from "@smartjob/shared";
import { CHAT_UPLOADS_DIR } from "../../config/storage.js";
import { HttpError } from "../../middleware/error.js";
import { prisma } from "../../config/prisma.js";
import { realtime } from "../realtime/realtime.bus.js";
import { ChatRepository } from "./chat.repository.js";
import { PushService } from "../push/push.service.js";

type Party = {
  id: string;
  name: string;
  role: "APPLICANT" | "RECRUITER";
  headline: string | null;
  company: { name: string } | null;
};

const toOtherParty = (p: Party) => ({
  id: p.id,
  name: p.name,
  role: p.role,
  headline: p.headline,
  companyName: p.company?.name ?? null,
});

const TYPING_TTL_MS = 5000;
const lastTyping = new Map<string, number>(); // `${userId}:${threadId}` → expiresAt

export const ChatService = {
  async startThread(recruiterId: string, applicantId: string) {
    if (recruiterId === applicantId) {
      throw new HttpError(400, "Can't start a thread with yourself");
    }
    const target = await prisma.user.findUnique({
      where: { id: applicantId },
      select: { id: true, role: true, searchable: true },
    });
    if (!target || target.role !== "APPLICANT") {
      throw new HttpError(404, "Applicant not found");
    }
    if (!target.searchable) {
      throw new HttpError(403, "This applicant has hidden their profile");
    }
    const existing = await ChatRepository.findThreadByPair(recruiterId, applicantId);
    if (existing) return existing;
    return ChatRepository.createThread(recruiterId, applicantId);
  },

  async getThread(threadId: string, userId: string) {
    const thread = await ChatRepository.findThreadParticipantInfo(threadId);
    if (!thread || (thread.recruiterId !== userId && thread.applicantId !== userId)) {
      throw new HttpError(404, "Thread not found");
    }
    const messages = await ChatRepository.listMessages(threadId);
    const isApplicant = thread.applicantId === userId;
    const recruiterHasSent = messages.some((m) => m.senderId === thread.recruiterId);
    const canReply = !isApplicant || recruiterHasSent;
    const otherParty =
      thread.recruiterId === userId ? thread.recruiter : thread.applicant;

    return {
      id: thread.id,
      otherParty: toOtherParty(otherParty),
      lastMessageAt:
        messages[messages.length - 1]?.createdAt.toISOString() ?? null,
      lastMessage: messages[messages.length - 1]?.body ?? null,
      unreadCount: 0,
      archived: isApplicant ? thread.applicantArchived : thread.recruiterArchived,
      messages: messages.map((m) => ({
        id: m.id,
        threadId: m.threadId,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt ? m.readAt.toISOString() : null,
        attachments: m.attachments.map((a) => ({
          id: a.id,
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.size,
        })),
      })),
      canReply,
    };
  },

  async sendMessage(
    threadId: string,
    userId: string,
    body: string,
    files: { storageKey: string; filename: string; mimeType: string; size: number }[],
  ) {
    const trimmed = body.trim();
    if (!trimmed && files.length === 0) {
      throw new HttpError(400, "Message body or attachments required");
    }
    const thread = await ChatRepository.findThreadParticipantInfo(threadId);
    if (!thread || (thread.recruiterId !== userId && thread.applicantId !== userId)) {
      throw new HttpError(404, "Thread not found");
    }
    if (thread.applicantId === userId) {
      const recruiterStarted = await ChatRepository.threadHasRecruiterMessage(
        threadId,
        thread.recruiterId,
      );
      if (!recruiterStarted) {
        throw new HttpError(
          403,
          "You can't message a recruiter who hasn't reached out first",
        );
      }
    }

    const message = await ChatRepository.insertMessage(threadId, userId, trimmed, files);
    const recipientId =
      thread.recruiterId === userId ? thread.applicantId : thread.recruiterId;

    realtime.publishToUser(recipientId, {
      type: "chat.message",
      threadId,
      messageId: message.id,
      senderId: userId,
    });

    if (!realtime.hasListeners(`user:${recipientId}`)) {
      void PushService.notifyMessage(recipientId, {
        threadId,
        senderName: thread.recruiterId === userId ? thread.recruiter.name : thread.applicant.name,
        preview: trimmed || `${files.length} attachment(s)`,
      }).catch((err) => console.error("[push] failed", err));
    }

    return {
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      readAt: message.readAt ? message.readAt.toISOString() : null,
      attachments: message.attachments.map((a) => ({
        id: a.id,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
      })),
    };
  },

  async markRead(threadId: string, userId: string) {
    const thread = await ChatRepository.findThreadParticipantInfo(threadId);
    if (!thread || (thread.recruiterId !== userId && thread.applicantId !== userId)) {
      throw new HttpError(404, "Thread not found");
    }
    await ChatRepository.markRead(threadId, userId);
    const otherId =
      thread.recruiterId === userId ? thread.applicantId : thread.recruiterId;
    realtime.publishToUser(otherId, {
      type: "chat.read",
      threadId,
      readerId: userId,
    });
  },

  async listThreads(userId: string, archived: boolean): Promise<ChatThreadSummary[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) return [];
    const threads = await ChatRepository.listThreadsForUser(
      userId,
      user.role as "RECRUITER" | "APPLICANT",
      archived,
    );

    return threads.map((t) => {
      const isRecruiter = t.recruiterId === userId;
      const otherParty = isRecruiter ? t.applicant : t.recruiter;
      const last = t.messages[0];
      return {
        id: t.id,
        otherParty: toOtherParty(otherParty),
        lastMessageAt: t.lastMessageAt ? t.lastMessageAt.toISOString() : null,
        lastMessage: last?.body ?? null,
        unreadCount: t._count.messages,
        archived: isRecruiter ? t.recruiterArchived : t.applicantArchived,
      };
    });
  },

  unreadCount: (userId: string) => ChatRepository.unreadCount(userId),

  async setArchived(threadId: string, userId: string, archived: boolean) {
    await ChatRepository.setArchived(threadId, userId, archived);
  },

  async search(userId: string, q: ChatSearchQuery) {
    const [rows, total] = await ChatRepository.searchMessages(
      userId,
      q.q,
      (q.page - 1) * q.pageSize,
      q.pageSize,
    );
    return {
      items: rows.map((row) => {
        const isRecruiter = row.thread.recruiterId === userId;
        const other = isRecruiter ? row.thread.applicant : row.thread.recruiter;
        const lower = row.body.toLowerCase();
        const idx = lower.indexOf(q.q.toLowerCase());
        const start = Math.max(0, idx - 20);
        const end = Math.min(row.body.length, idx + q.q.length + 30);
        return {
          messageId: row.id,
          threadId: row.thread.id,
          otherParty: toOtherParty(other),
          snippet: (start > 0 ? "…" : "") + row.body.slice(start, end) + (end < row.body.length ? "…" : ""),
          createdAt: row.createdAt.toISOString(),
        };
      }),
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.ceil(total / q.pageSize),
    };
  },

  async typing(threadId: string, userId: string) {
    const thread = await ChatRepository.findThreadParticipantInfo(threadId);
    if (!thread || (thread.recruiterId !== userId && thread.applicantId !== userId)) {
      throw new HttpError(404, "Thread not found");
    }
    const key = `${userId}:${threadId}`;
    const now = Date.now();
    const last = lastTyping.get(key) ?? 0;
    if (now - last < 2000) return;
    lastTyping.set(key, now);

    const expiresAt = new Date(now + TYPING_TTL_MS).toISOString();
    const otherId =
      thread.recruiterId === userId ? thread.applicantId : thread.recruiterId;
    realtime.publishToUser(otherId, {
      type: "chat.typing",
      threadId,
      userId,
      expiresAt,
    });
  },

  async streamAttachment(attachmentId: string, requesterId: string) {
    const att = await ChatRepository.getAttachment(attachmentId, requesterId);
    if (!att) throw new HttpError(404, "Attachment not found");
    const absPath = path.join(CHAT_UPLOADS_DIR, att.storageKey);
    if (!fs.existsSync(absPath)) throw new HttpError(404, "Attachment file is missing on disk");
    return { absPath, filename: att.filename, mimeType: att.mimeType, size: att.size };
  },

  async listCompanyThreads(companyId: string) {
    const threads = await ChatRepository.listCompanyThreads(companyId);
    return threads.map((t) => {
      const last = t.messages[0];
      return {
        id: t.id,
        otherParty: toOtherParty(t.applicant),
        ownerRecruiterName: t.recruiter.name,
        lastMessageAt: t.lastMessageAt ? t.lastMessageAt.toISOString() : null,
        lastMessage: last?.body ?? null,
        unreadCount: 0,
        archived: false,
      };
    });
  },
};
