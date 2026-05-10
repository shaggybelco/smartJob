import type { AppStatus, RecruiterFunnelSummary } from "@smartjob/shared";
import { APP_STATUSES } from "@smartjob/shared";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { RecruiterRepository } from "../jobs/jobs.repository.js";

const ratio = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 1000;

const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
  }
  return sorted[mid] ?? 0;
};

export const RecruiterFunnelService = {
  async summary(userId: string): Promise<RecruiterFunnelSummary> {
    const recruiter = await RecruiterRepository.findCompanyId(userId);
    if (!recruiter?.companyId) throw new HttpError(403, "Recruiter has no company");
    const companyId = recruiter.companyId;

    const [jobsTotal, jobsOpen, grouped, applications] = await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId, status: "OPEN" } }),
      prisma.jobApplication.groupBy({
        by: ["status"],
        where: { job: { companyId } },
        _count: { _all: true },
      }),
      prisma.jobApplication.findMany({
        where: { job: { companyId } },
        select: { createdAt: true, updatedAt: true, status: true },
      }),
    ]);

    const byStatus = Object.fromEntries(APP_STATUSES.map((s) => [s, 0])) as Record<AppStatus, number>;
    for (const row of grouped) byStatus[row.status as AppStatus] = row._count._all;

    const totalApplications = applications.length;
    const offers = byStatus.OFFER;
    const screening = byStatus.SCREENING + byStatus.INTERVIEW + byStatus.OFFER + byStatus.REJECTED;
    const interview = byStatus.INTERVIEW + byStatus.OFFER;

    const offerDurations = applications
      .filter((a) => a.status === "OFFER")
      .map((a) => (a.updatedAt.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const monthlyMap = new Map<string, { applications: number; offers: number }>();
    for (const a of applications) {
      const d = a.createdAt;
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const slot = monthlyMap.get(key) ?? { applications: 0, offers: 0 };
      slot.applications += 1;
      if (a.status === "OFFER") slot.offers += 1;
      monthlyMap.set(key, slot);
    }
    const monthlyTrend = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, slot]) => ({ month, ...slot }));

    return {
      totals: { jobs: jobsTotal, openJobs: jobsOpen, applications: totalApplications, offers },
      byStatus,
      conversion: {
        appliedToScreening: ratio(screening, totalApplications),
        screeningToInterview: ratio(interview, screening),
        interviewToOffer: ratio(offers, interview),
      },
      medianDaysToOffer: median(offerDurations),
      monthlyTrend,
    };
  },
};
