import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const ApplicationRepository = {
  list: (where: Prisma.ApplicationWhereInput, orderBy: Prisma.ApplicationOrderByWithRelationInput, skip: number, take: number) =>
    Promise.all([
      prisma.application.findMany({ where, orderBy, skip, take }),
      prisma.application.count({ where }),
    ]),

  findOwnedById: (id: string, userId: string) =>
    prisma.application.findFirst({
      where: { id, userId },
      include: {
        events: { orderBy: { occurredAt: "desc" } },
        reminders: { orderBy: { dueAt: "asc" } },
      },
    }),

  findOwnedSummary: (id: string, userId: string) =>
    prisma.application.findFirst({
      where: { id, userId },
      select: { id: true, jobApplicationId: true },
    }),

  create: (data: Prisma.ApplicationUncheckedCreateInput) =>
    prisma.application.create({ data }),

  update: (id: string, data: Prisma.ApplicationUpdateInput) =>
    prisma.application.update({ where: { id }, data }),

  delete: (id: string) => prisma.application.delete({ where: { id } }),
};
