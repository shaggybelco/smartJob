import { CreateEventInput } from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { EventsService } from "./events.service.js";

export const EventsController = {
  list: asyncHandler(async (req, res) => {
    const applicationId = req.params.id!;
    res.json(await EventsService.list(applicationId, req.userId!));
  }),

  create: asyncHandler(async (req, res) => {
    const applicationId = req.params.id!;
    const input = CreateEventInput.parse(req.body);
    const event = await EventsService.create(applicationId, req.userId!, input);
    res.status(201).json(event);
  }),
};
