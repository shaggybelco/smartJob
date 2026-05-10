import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { companyPublicSelect } from "../jobs/jobs.repository.js";

const applicantPublicSelect = {
  id: true,
  name: true,
  email: true,
} as const satisfies Prisma.UserSelect;

const answersInclude = {
  answers: { include: { question: { select: { id: true, prompt: true } } } },
} as const satisfies Prisma.JobApplicationInclude;

export const JobApplicationRepository = {
  findByJobAndApplicant: (jobId: string, applicantId: string) =>
    prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId, applicantId } },
      select: { id: true },
    }),

  listByJob: (jobId: string) =>
    prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
      include: { applicant: { select: applicantPublicSelect } },
    }),

  listByApplicant: (applicantId: string) =>
    prisma.jobApplication.findMany({
      where: { applicantId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        jobId: true,
        applicantId: true,
        coverLetter: true,
        resumeUrl: true,
        resumeStorageKey: true,
        resumeFilename: true,
        resumeMimeType: true,
        resumeSize: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            description: true,
            status: true,
            company: { select: companyPublicSelect },
          },
        },
      },
    }),

  listForCompany: (companyId: string, status?: Prisma.JobApplicationWhereInput["status"]) =>
    prisma.jobApplication.findMany({
      where: { job: { companyId }, ...(status ? { status } : {}) },
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        applicant: { select: applicantPublicSelect },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            company: { select: companyPublicSelect },
          },
        },
      },
    }),

  findForRecruiter: (id: string, recruiterCompanyId: string) =>
    prisma.jobApplication.findFirst({
      where: { id, job: { companyId: recruiterCompanyId } },
      include: {
        applicant: { select: applicantPublicSelect },
        job: { include: { company: { select: companyPublicSelect } } },
        trackerEntry: { select: { id: true } },
        ...answersInclude,
      },
    }),

  findOwnedByApplicant: (id: string, applicantId: string) =>
    prisma.jobApplication.findFirst({
      where: { id, applicantId },
      select: { id: true, status: true, job: { select: { id: true, companyId: true } } },
    }),

  bulkUpdateForCompany: async (
    ids: string[],
    companyId: string,
    status: Prisma.JobApplicationUpdateInput["status"],
  ) => {
    return prisma.$transaction(async (tx) => {
      const allowed = await tx.jobApplication.findMany({
        where: { id: { in: ids }, job: { companyId } },
        select: { id: true, trackerEntry: { select: { id: true } } },
      });
      const allowedIds = allowed.map((a) => a.id);
      const trackerIds = allowed.map((a) => a.trackerEntry?.id).filter(Boolean) as string[];
      await tx.jobApplication.updateMany({
        where: { id: { in: allowedIds } },
        data: { status },
      });
      if (trackerIds.length > 0) {
        await tx.application.updateMany({
          where: { id: { in: trackerIds } },
          data: { status },
        });
      }
      return allowedIds;
    });
  },

  updateInTx: (
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.JobApplicationUpdateInput,
  ) => tx.jobApplication.update({ where: { id }, data }),

  mirrorTrackerStatus: (
    tx: Prisma.TransactionClient,
    trackerEntryId: string,
    status: Prisma.ApplicationUpdateInput["status"],
  ) => tx.application.update({ where: { id: trackerEntryId }, data: { status } }),
};
