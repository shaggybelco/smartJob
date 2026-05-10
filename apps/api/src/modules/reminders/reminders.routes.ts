import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { RemindersController } from "./reminders.controller.js";

// Mounted at /api/applications/:id/reminders
export const remindersOnApplicationRouter = Router({ mergeParams: true });
remindersOnApplicationRouter.use(requireAuth);
remindersOnApplicationRouter.post("/", RemindersController.createOnApplication);

// Mounted at /api/reminders
export const remindersRouter = Router();
remindersRouter.use(requireAuth);
remindersRouter.patch("/:id", RemindersController.update);
remindersRouter.delete("/:id", RemindersController.remove);
