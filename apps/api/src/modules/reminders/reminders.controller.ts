import { CreateReminderInput, UpdateReminderInput } from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { RemindersService } from "./reminders.service.js";

export const RemindersController = {
  createOnApplication: asyncHandler(async (req, res) => {
    const applicationId = req.params.id!;
    const input = CreateReminderInput.parse(req.body);
    const reminder = await RemindersService.createOnApplication(
      applicationId,
      req.userId!,
      input,
    );
    res.status(201).json(reminder);
  }),

  update: asyncHandler(async (req, res) => {
    const input = UpdateReminderInput.parse(req.body);
    const updated = await RemindersService.update(req.params.id!, req.userId!, input);
    res.json(updated);
  }),

  remove: asyncHandler(async (req, res) => {
    await RemindersService.remove(req.params.id!, req.userId!);
    res.status(204).end();
  }),
};
