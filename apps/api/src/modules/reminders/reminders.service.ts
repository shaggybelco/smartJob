import type { CreateReminderInput, UpdateReminderInput } from "@smartjob/shared";
import { HttpError } from "../../middleware/error.js";
import { ReminderRepository } from "./reminders.repository.js";

export const RemindersService = {
  async createOnApplication(
    applicationId: string,
    userId: string,
    input: CreateReminderInput,
  ) {
    const owned = await ReminderRepository.ensureApplicationOwned(applicationId, userId);
    if (!owned) throw new HttpError(404, "Application not found");

    return ReminderRepository.create({
      applicationId,
      dueAt: new Date(input.dueAt),
      message: input.message,
    });
  },

  async update(id: string, userId: string, input: UpdateReminderInput) {
    const reminder = await ReminderRepository.findOwned(id, userId);
    if (!reminder) throw new HttpError(404, "Reminder not found");

    return ReminderRepository.update(id, {
      ...(input.dueAt !== undefined ? { dueAt: new Date(input.dueAt) } : {}),
      ...(input.message !== undefined ? { message: input.message } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
    });
  },

  async remove(id: string, userId: string) {
    const reminder = await ReminderRepository.findOwned(id, userId);
    if (!reminder) throw new HttpError(404, "Reminder not found");
    await ReminderRepository.delete(id);
  },
};
