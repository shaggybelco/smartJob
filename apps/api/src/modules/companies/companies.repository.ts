import { prisma } from "../../config/prisma.js";
import { companyPublicSelect } from "../jobs/jobs.repository.js";

export const CompanyRepository = {
  findPublicById: (id: string) =>
    prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        website: true,
        description: true,
        _count: { select: { jobs: { where: { status: "OPEN" } } } },
      },
    }),

  listOpenJobs: (companyId: string) =>
    prisma.job.findMany({
      where: { companyId, status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: companyPublicSelect },
        skills: { include: { skill: true } },
      },
    }),
};
