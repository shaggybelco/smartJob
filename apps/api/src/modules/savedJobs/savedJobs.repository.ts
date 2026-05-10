import { prisma } from "../../config/prisma.js";
import { companyPublicSelect } from "../jobs/jobs.repository.js";

export const SavedJobRepository = {
  list: (userId: string) =>
    prisma.savedJob.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      include: {
        job: {
          include: {
            company: { select: companyPublicSelect },
            skills: { include: { skill: true } },
          },
        },
      },
    }),

  add: (userId: string, jobId: string) =>
    prisma.savedJob.upsert({
      where: { userId_jobId: { userId, jobId } },
      update: {},
      create: { userId, jobId },
    }),

  remove: (userId: string, jobId: string) =>
    prisma.savedJob.deleteMany({ where: { userId, jobId } }),

  ids: (userId: string) =>
    prisma.savedJob.findMany({
      where: { userId },
      select: { jobId: true },
    }),
};
