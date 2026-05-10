import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const ReminderRepository = {
  ensureApplicationOwned: (applicationId: string, userId: string) =>
    prisma.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true },
    }),

  findOwned: (id: string, userId: string) =>
    prisma.reminder.findFirst({
      where: { id, application: { userId } },
    }),

  create: (data: Prisma.ReminderUncheckedCreateInput) =>
    prisma.reminder.create({ data }),

  update: (id: string, data: Prisma.ReminderUpdateInput) =>
    prisma.reminder.update({ where: { id }, data }),

  delete: (id: string) => prisma.reminder.delete({ where: { id } }),
};
