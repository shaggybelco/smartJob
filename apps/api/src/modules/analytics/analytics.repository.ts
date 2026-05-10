import { prisma } from "../../config/prisma.js";

export const AnalyticsRepository = {
  countByStatus: (userId: string) =>
    prisma.application.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),

  appliedDates: (userId: string) =>
    prisma.application.findMany({
      where: { userId },
      select: { appliedAt: true },
    }),
};
