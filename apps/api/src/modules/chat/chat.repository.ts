import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

const otherPartyShape = {
  id: true,
  name: true,
  role: true,
  headline: true,
  company: { select: { name: true } },
} as const satisfies Prisma.UserSelect;

const messageShape = {
  id: true,
  threadId: true,
  senderId: true,
  body: true,
  createdAt: true,
  readAt: true,
  attachments: {
    select: { id: true, filename: true, mimeType: true, size: true },
  },
} as const satisfies Prisma.ChatMessageSelect;

export const ChatRepository = {
  findThreadByPair: (recruiterId: string, applicantId: string) =>
    prisma.chatThread.findUnique({
      where: { recruiterId_applicantId: { recruiterId, applicantId } },
      select: { id: true },
    }),

  createThread: (recruiterId: string, applicantId: string) =>
    prisma.chatThread.create({
      data: { recruiterId, applicantId },
      select: { id: true },
    }),

  findThreadParticipantInfo: (id: string) =>
    prisma.chatThread.findUnique({
      where: { id },
      select: {
        id: true,
        recruiterId: true,
        applicantId: true,
        recruiterArchived: true,
        applicantArchived: true,
        recruiter: { select: otherPartyShape },
        applicant: { select: otherPartyShape },
      },
    }),

  threadHasRecruiterMessage: async (threadId: string, recruiterId: string) => {
    const found = await prisma.chatMessage.findFirst({
      where: { threadId, senderId: recruiterId },
      select: { id: true },
    });
    return !!found;
  },

  insertMessage: (
    threadId: string,
    senderId: string,
    body: string,
    attachments: { storageKey: string; filename: string; mimeType: string; size: number }[],
  ) =>
    prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: {
          threadId,
          senderId,
          body,
          attachments: attachments.length
            ? { create: attachments }
            : undefined,
        },
        select: messageShape,
      });
      await tx.chatThread.update({
        where: { id: threadId },
        data: { lastMessageAt: message.createdAt },
      });
      return message;
    }),

  listMessages: (threadId: string) =>
    prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      select: messageShape,
    }),

  markRead: (threadId: string, readerId: string) =>
    prisma.chatMessage.updateMany({
      where: { threadId, senderId: { not: readerId }, readAt: null },
      data: { readAt: new Date() },
    }),

  listThreadsForUser: (
    userId: string,
    role: "RECRUITER" | "APPLICANT",
    archived: boolean,
  ) => {
    const archivedField =
      role === "RECRUITER" ? "recruiterArchived" : "applicantArchived";
    const idField = role === "RECRUITER" ? "recruiterId" : "applicantId";
    return prisma.chatThread.findMany({
      where: { [idField]: userId, [archivedField]: archived },
      orderBy: { lastMessageAt: "desc" },
      select: {
        id: true,
        recruiterId: true,
        applicantId: true,
        lastMessageAt: true,
        recruiterArchived: true,
        applicantArchived: true,
        recruiter: { select: otherPartyShape },
        applicant: { select: otherPartyShape },
        messages: {
          select: { body: true, senderId: true, createdAt: true, readAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: { where: { senderId: { not: userId }, readAt: null } },
          },
        },
      },
    });
  },

  unreadCount: (userId: string) =>
    prisma.chatMessage.count({
      where: {
        senderId: { not: userId },
        readAt: null,
        thread: {
          OR: [{ recruiterId: userId }, { applicantId: userId }],
        },
      },
    }),

  setArchived: (threadId: string, userId: string, archived: boolean) =>
    prisma.chatThread.updateMany({
      where: {
        id: threadId,
        OR: [{ recruiterId: userId }, { applicantId: userId }],
      },
      data: {
        recruiterArchived: archived,
        applicantArchived: archived,
      },
    }).then(() =>
      prisma.chatThread.findUnique({
        where: { id: threadId },
        select: { recruiterId: true, applicantId: true },
      }).then((t) => {
        if (!t) return;
        if (t.recruiterId === userId) {
          return prisma.chatThread.update({
            where: { id: threadId },
            data: { recruiterArchived: archived },
            select: { id: true },
          });
        }
        return prisma.chatThread.update({
          where: { id: threadId },
          data: { applicantArchived: archived },
          select: { id: true },
        });
      }),
    ),

  searchMessages: (userId: string, q: string, skip: number, take: number) =>
    Promise.all([
      prisma.chatMessage.findMany({
        where: {
          body: { contains: q, mode: "insensitive" },
          thread: {
            OR: [{ recruiterId: userId }, { applicantId: userId }],
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          body: true,
          createdAt: true,
          thread: {
            select: {
              id: true,
              recruiterId: true,
              applicantId: true,
              recruiter: { select: otherPartyShape },
              applicant: { select: otherPartyShape },
            },
          },
        },
      }),
      prisma.chatMessage.count({
        where: {
          body: { contains: q, mode: "insensitive" },
          thread: {
            OR: [{ recruiterId: userId }, { applicantId: userId }],
          },
        },
      }),
    ]),

  getAttachment: (id: string, requesterId: string) =>
    prisma.chatAttachment.findFirst({
      where: {
        id,
        message: {
          thread: {
            OR: [{ recruiterId: requesterId }, { applicantId: requesterId }],
          },
        },
      },
      select: {
        id: true,
        storageKey: true,
        filename: true,
        mimeType: true,
        size: true,
      },
    }),

  listCompanyThreads: (companyId: string) =>
    prisma.chatThread.findMany({
      where: { recruiter: { companyId } },
      orderBy: { lastMessageAt: "desc" },
      select: {
        id: true,
        recruiterId: true,
        applicantId: true,
        lastMessageAt: true,
        recruiter: { select: { id: true, name: true, headline: true, company: { select: { name: true } }, role: true } },
        applicant: { select: otherPartyShape },
        messages: {
          select: { body: true, senderId: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
};
