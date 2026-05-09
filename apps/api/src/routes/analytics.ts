import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { APP_STATUSES, type AppStatus } from "@smartjob/shared";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get("/summary", async (req, res, next) => {
  try {
    const userId = req.userId!;

    const [grouped, applications] = await Promise.all([
      prisma.application.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.application.findMany({
        where: { userId },
        select: { appliedAt: true },
      }),
    ]);

    const byStatus = Object.fromEntries(
      APP_STATUSES.map((s) => [s, 0]),
    ) as Record<AppStatus, number>;
    for (const row of grouped) byStatus[row.status as AppStatus] = row._count._all;

    const monthlyMap = new Map<string, number>();
    for (const a of applications) {
      const d = a.appliedAt;
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
    }
    const monthlyTrend = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    res.json({
      totals: {
        applications: applications.length,
        interviews: byStatus.INTERVIEW,
        offers: byStatus.OFFER,
        rejections: byStatus.REJECTED,
      },
      byStatus,
      monthlyTrend,
    });
  } catch (err) {
    next(err);
  }
});
