import { APP_STATUSES, type AnalyticsSummary, type AppStatus } from "@smartjob/shared";
import { AnalyticsRepository } from "./analytics.repository.js";

export const AnalyticsService = {
  async summary(userId: string): Promise<AnalyticsSummary> {
    const [grouped, applications] = await Promise.all([
      AnalyticsRepository.countByStatus(userId),
      AnalyticsRepository.appliedDates(userId),
    ]);

    const byStatus = Object.fromEntries(APP_STATUSES.map((s) => [s, 0])) as Record<AppStatus, number>;
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

    return {
      totals: {
        applications: applications.length,
        interviews: byStatus.INTERVIEW,
        offers: byStatus.OFFER,
        rejections: byStatus.REJECTED,
      },
      byStatus,
      monthlyTrend,
    };
  },
};
