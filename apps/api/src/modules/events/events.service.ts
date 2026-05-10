import type { CreateEventInput } from "@smartjob/shared";
import { HttpError } from "../../middleware/error.js";
import { EventRepository } from "./events.repository.js";

const ensureOwned = async (applicationId: string, userId: string) => {
  const owned = await EventRepository.ensureApplicationOwned(applicationId, userId);
  if (!owned) throw new HttpError(404, "Application not found");
};

export const EventsService = {
  async list(applicationId: string, userId: string) {
    await ensureOwned(applicationId, userId);
    return EventRepository.listByApplication(applicationId);
  },

  async create(applicationId: string, userId: string, input: CreateEventInput) {
    await ensureOwned(applicationId, userId);
    return EventRepository.create({
      applicationId,
      type: input.type,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      notes: input.notes ?? null,
    });
  },
};
