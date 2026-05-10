import {
  ChatSearchQuery,
  SendMessageInput,
  StartThreadInput,
} from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { ChatService } from "./chat.service.js";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../middleware/error.js";

export const ChatController = {
  startThread: asyncHandler(async (req, res) => {
    const input = StartThreadInput.parse(req.body);
    const thread = await ChatService.startThread(req.userId!, input.applicantId);
    res.status(201).json({ id: thread.id });
  }),

  listThreads: asyncHandler(async (req, res) => {
    const archived = req.query.archived === "true";
    res.json(await ChatService.listThreads(req.userId!, archived));
  }),

  unreadCount: asyncHandler(async (req, res) => {
    const count = await ChatService.unreadCount(req.userId!);
    res.json({ unread: count });
  }),

  thread: asyncHandler(async (req, res) => {
    res.json(await ChatService.getThread(req.params.id!, req.userId!));
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const body = SendMessageInput.parse({ body: req.body?.body });
    const files =
      ((req as unknown as { files?: Express.Multer.File[] }).files ?? []).map((f) => ({
        storageKey: f.filename,
        filename: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
      }));
    const message = await ChatService.sendMessage(
      req.params.id!,
      req.userId!,
      body.body ?? "",
      files,
    );
    res.status(201).json(message);
  }),

  markRead: asyncHandler(async (req, res) => {
    await ChatService.markRead(req.params.id!, req.userId!);
    res.status(204).end();
  }),

  archive: asyncHandler(async (req, res) => {
    await ChatService.setArchived(req.params.id!, req.userId!, true);
    res.status(204).end();
  }),

  unarchive: asyncHandler(async (req, res) => {
    await ChatService.setArchived(req.params.id!, req.userId!, false);
    res.status(204).end();
  }),

  search: asyncHandler(async (req, res) => {
    const q = ChatSearchQuery.parse(req.query);
    res.json(await ChatService.search(req.userId!, q));
  }),

  typing: asyncHandler(async (req, res) => {
    await ChatService.typing(req.params.id!, req.userId!);
    res.status(204).end();
  }),

  attachment: asyncHandler(async (req, res) => {
    const a = await ChatService.streamAttachment(req.params.id!, req.userId!);
    res.setHeader("Content-Type", a.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${a.filename.replace(/"/g, "")}"`,
    );
    res.sendFile(a.absPath);
  }),

  teamThreads: asyncHandler(async (req, res) => {
    const me = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { companyId: true },
    });
    if (!me?.companyId) throw new HttpError(403, "No company");
    res.json(await ChatService.listCompanyThreads(me.companyId));
  }),

  teamThreadDetail: asyncHandler(async (req, res) => {
    const me = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { companyId: true },
    });
    if (!me?.companyId) throw new HttpError(403, "No company");
    const thread = await prisma.chatThread.findFirst({
      where: { id: req.params.id!, recruiter: { companyId: me.companyId } },
      select: { recruiterId: true },
    });
    if (!thread) throw new HttpError(404, "Thread not found");
    // Reuse the service get for the recruiter's perspective (admin sees as the recruiter)
    res.json(await ChatService.getThread(req.params.id!, thread.recruiterId));
  }),
};
