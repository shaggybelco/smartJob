import { Router } from "express";
import { CreateReminderInput, UpdateReminderInput } from "@smartjob/shared";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

// Mounted at /applications/:id/reminders for create
export const remindersOnApplicationRouter = Router({ mergeParams: true });
remindersOnApplicationRouter.use(requireAuth);

remindersOnApplicationRouter.post("/", async (req, res, next) => {
  try {
    const applicationId = req.params.id!;
    const owned = await prisma.application.findFirst({
      where: { id: applicationId, userId: req.userId! },
      select: { id: true },
    });
    if (!owned) throw new HttpError(404, "Application not found");

    const input = CreateReminderInput.parse(req.body);
    const reminder = await prisma.reminder.create({
      data: { applicationId, dueAt: new Date(input.dueAt), message: input.message },
    });
    res.status(201).json(reminder);
  } catch (err) {
    next(err);
  }
});

// Mounted at /reminders for patch/delete (lookups go through join to enforce ownership)
export const remindersRouter = Router();
remindersRouter.use(requireAuth);

const ensureOwnedReminder = async (reminderId: string, userId: string) => {
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, application: { userId } },
  });
  if (!reminder) throw new HttpError(404, "Reminder not found");
  return reminder;
};

remindersRouter.patch("/:id", async (req, res, next) => {
  try {
    await ensureOwnedReminder(req.params.id, req.userId!);
    const input = UpdateReminderInput.parse(req.body);
    const updated = await prisma.reminder.update({
      where: { id: req.params.id },
      data: {
        ...(input.dueAt !== undefined ? { dueAt: new Date(input.dueAt) } : {}),
        ...(input.message !== undefined ? { message: input.message } : {}),
        ...(input.completed !== undefined ? { completed: input.completed } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

remindersRouter.delete("/:id", async (req, res, next) => {
  try {
    await ensureOwnedReminder(req.params.id, req.userId!);
    await prisma.reminder.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
