import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const companyPublicSelect = {
  id: true,
  name: true,
  website: true,
  description: true,
} as const satisfies Prisma.CompanySelect;

const jobInclude = {
  company: { select: companyPublicSelect },
  skills: { include: { skill: true } },
  questions: { orderBy: { position: "asc" } },
} satisfies Prisma.JobInclude;

const jobInboxInclude = {
  ...jobInclude,
  _count: { select: { applications: true } },
} satisfies Prisma.JobInclude;

export const JobRepository = {
  list: (where: Prisma.JobWhereInput, skip: number, take: number) =>
    Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: jobInclude,
      }),
      prisma.job.count({ where }),
    ]),

  findById: (id: string) =>
    prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    }),

  findOwnedSummary: (jobId: string, companyId: string) =>
    prisma.job.findFirst({
      where: { id: jobId, companyId },
      select: { id: true },
    }),

  listForCompany: (companyId: string) =>
    prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: jobInboxInclude,
    }),

  create: (data: Prisma.JobUncheckedCreateInput) =>
    prisma.job.create({ data, include: jobInclude }),

  update: (id: string, data: Prisma.JobUpdateInput) =>
    prisma.job.update({ where: { id }, data, include: jobInclude }),

  delete: (id: string) => prisma.job.delete({ where: { id } }),

  replaceSkills: async (jobId: string, skillIds: string[]) => {
    await prisma.jobSkill.deleteMany({ where: { jobId } });
    if (skillIds.length > 0) {
      await prisma.jobSkill.createMany({
        data: skillIds.map((skillId) => ({ jobId, skillId })),
        skipDuplicates: true,
      });
    }
  },

  replaceQuestions: async (
    jobId: string,
    questions: { prompt: string; required: boolean; position: number }[],
  ) => {
    await prisma.jobQuestion.deleteMany({ where: { jobId } });
    if (questions.length > 0) {
      await prisma.jobQuestion.createMany({
        data: questions.map((q) => ({ ...q, jobId })),
      });
    }
  },
};

export const RecruiterRepository = {
  findCompanyId: (userId: string) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true },
    }),
};

export const flattenJobSkills = <T extends { skills?: { skill: { id: string; name: string; slug: string } }[] }>(job: T) => ({
  ...job,
  skills: job.skills?.map((s) => s.skill) ?? [],
});
