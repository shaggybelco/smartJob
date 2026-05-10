import { Router } from "express";
import {
  requireApprovedRecruiter,
  requireAuth,
  requireCompanyAdmin,
} from "../../middleware/auth.js";
import { ChatController } from "./chat.controller.js";
import { chatUpload } from "./chatUploads.middleware.js";

export const chatRouter = Router();
chatRouter.use(requireAuth);

chatRouter.get("/threads", ChatController.listThreads);
chatRouter.get("/unread-count", ChatController.unreadCount);
chatRouter.get("/search", ChatController.search);
chatRouter.post("/threads", requireApprovedRecruiter, ChatController.startThread);
chatRouter.get("/threads/:id", ChatController.thread);
chatRouter.post("/threads/:id/messages", chatUpload, ChatController.sendMessage);
chatRouter.post("/threads/:id/read", ChatController.markRead);
chatRouter.post("/threads/:id/archive", ChatController.archive);
chatRouter.post("/threads/:id/unarchive", ChatController.unarchive);
chatRouter.post("/threads/:id/typing", ChatController.typing);
chatRouter.get("/attachments/:id", ChatController.attachment);

export const teamChatRouter = Router();
teamChatRouter.use(requireAuth, requireCompanyAdmin);
teamChatRouter.get("/", ChatController.teamThreads);
teamChatRouter.get("/:id", ChatController.teamThreadDetail);
