import { Router } from "express";
import { CreateEventInput } from "@smartjob/shared";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const eventsRouter = Router({ mergeParams: true });

eventsRouter.use(requireAuth);

const ensureOwned = async (applicationId: string, userId: string) => {
  const owned = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: { id: true },
  });
  if (!owned) throw new HttpError(404, "Application not found");
};

eventsRouter.get("/", async (req, res, next) => {
  try {
    const applicationId = req.params.id!;
    await ensureOwned(applicationId, req.userId!);
    const events = await prisma.event.findMany({
      where: { applicationId },
      orderBy: { occurredAt: "desc" },
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/", async (req, res, next) => {
  try {
    const applicationId = req.params.id!;
    await ensureOwned(applicationId, req.userId!);
    const input = CreateEventInput.parse(req.body);
    const event = await prisma.event.create({
      data: {
        applicationId,
        type: input.type,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
        notes: input.notes ?? null,
      },
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});
