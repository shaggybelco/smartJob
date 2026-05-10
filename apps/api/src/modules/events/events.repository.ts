import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const EventRepository = {
  ensureApplicationOwned: (applicationId: string, userId: string) =>
    prisma.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true },
    }),

  listByApplication: (applicationId: string) =>
    prisma.event.findMany({
      where: { applicationId },
      orderBy: { occurredAt: "desc" },
    }),

  create: (data: Prisma.EventUncheckedCreateInput) =>
    prisma.event.create({ data }),
};
