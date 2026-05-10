import type {
  ApplyToJobInput,
  CreateJobInput,
  JobsListQuery,
  UpdateJobInput,
} from "@smartjob/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { JobRepository, RecruiterRepository, flattenJobSkills } from "./jobs.repository.js";
import { JobApplicationRepository } from "../jobApplications/jobApplications.repository.js";
import { SkillRepository, slugify } from "../skills/skills.repository.js";
import { realtime } from "../realtime/realtime.bus.js";

const requireRecruiterCompany = async (userId: string) => {
  const recruiter = await RecruiterRepository.findCompanyId(userId);
  if (!recruiter?.companyId) throw new HttpError(403, "Recruiter has no company");
  return recruiter as { id: string; companyId: string };
};

const ensureRecruiterOwnsJob = async (jobId: string, userId: string) => {
  const recruiter = await requireRecruiterCompany(userId);
  const job = await JobRepository.findOwnedSummary(jobId, recruiter.companyId);
  if (!job) throw new HttpError(404, "Job not found");
  return { recruiter };
};

export const JobsService = {
  async listPublic(q: JobsListQuery) {
    const status = q.status ?? "OPEN";
    const where: Prisma.JobWhereInput = {
      status,
      ...(q.q
        ? {
            OR: [
              { title: { contains: q.q, mode: "insensitive" } },
              { description: { contains: q.q, mode: "insensitive" } },
              { company: { name: { contains: q.q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(q.location ? { location: { contains: q.location, mode: "insensitive" } } : {}),
      ...(q.remote === true ? { remote: true } : {}),
      ...(q.salaryMin ? { salaryMax: { gte: q.salaryMin } } : {}),
      ...(q.salaryMax ? { salaryMin: { lte: q.salaryMax } } : {}),
      ...(q.skill
        ? { skills: { some: { skill: { slug: slugify(q.skill) } } } }
        : {}),
    };

    const [items, total] = await JobRepository.list(
      where,
      (q.page - 1) * q.pageSize,
      q.pageSize,
    );
    return {
      items: items.map(flattenJobSkills),
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.ceil(total / q.pageSize),
    };
  },

  async getPublic(id: string) {
    const job = await JobRepository.findById(id);
    if (!job) throw new HttpError(404, "Job not found");
    return flattenJobSkills(job);
  },

  async create(userId: string, input: CreateJobInput) {
    const recruiter = await requireRecruiterCompany(userId);

    const created = await JobRepository.create({
      title: input.title,
      description: input.description,
      location: input.location ?? null,
      remote: input.remote ?? false,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      companyId: recruiter.companyId,
      postedById: recruiter.id,
    });

    if (input.skills?.length) {
      const skills = await SkillRepository.upsertMany(input.skills);
      await JobRepository.replaceSkills(created.id, skills.map((s) => s.id));
    }
    if (input.questions?.length) {
      await JobRepository.replaceQuestions(
        created.id,
        input.questions.map((q, i) => ({
          prompt: q.prompt,
          required: q.required ?? false,
          position: q.position ?? i,
        })),
      );
    }

    const full = await JobRepository.findById(created.id);
    return flattenJobSkills(full!);
  },

  async update(jobId: string, userId: string, input: UpdateJobInput) {
    await ensureRecruiterOwnsJob(jobId, userId);

    const data: Prisma.JobUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.location !== undefined) data.location = input.location;
    if (input.remote !== undefined) data.remote = input.remote;
    if (input.salaryMin !== undefined) data.salaryMin = input.salaryMin;
    if (input.salaryMax !== undefined) data.salaryMax = input.salaryMax;
    if (input.status !== undefined) data.status = input.status;

    await JobRepository.update(jobId, data);

    if (input.skills) {
      const skills = await SkillRepository.upsertMany(input.skills);
      await JobRepository.replaceSkills(jobId, skills.map((s) => s.id));
    }
    if (input.questions) {
      await JobRepository.replaceQuestions(
        jobId,
        input.questions.map((q, i) => ({
          prompt: q.prompt,
          required: q.required ?? false,
          position: q.position ?? i,
        })),
      );
    }

    const full = await JobRepository.findById(jobId);
    return flattenJobSkills(full!);
  },

  async close(jobId: string, userId: string) {
    await ensureRecruiterOwnsJob(jobId, userId);
    const updated = await JobRepository.update(jobId, { status: "CLOSED" });
    return flattenJobSkills(updated);
  },

  async remove(jobId: string, userId: string) {
    await ensureRecruiterOwnsJob(jobId, userId);
    await JobRepository.delete(jobId);
  },

  listMyCompanyJobs: async (userId: string) => {
    const recruiter = await requireRecruiterCompany(userId);
    const jobs = await JobRepository.listForCompany(recruiter.companyId);
    return jobs.map(flattenJobSkills);
  },

  listInbox: async (jobId: string, userId: string) => {
    await ensureRecruiterOwnsJob(jobId, userId);
    return JobApplicationRepository.listByJob(jobId);
  },

  async applyToJob(
    jobId: string,
    applicantId: string,
    input: ApplyToJobInput,
    resumeFile?: {
      storageKey: string;
      originalName: string;
      mimeType: string;
      size: number;
    },
  ) {
    const job = await JobRepository.findById(jobId);
    if (!job) throw new HttpError(404, "Job not found");
    if (job.status !== "OPEN") throw new HttpError(400, "Job is not open for applications");

    const hasCoverLetter = !!input.coverLetter && input.coverLetter.trim().length > 0;
    const hasResumeUrl = !!input.resumeUrl;
    if (!hasCoverLetter && !hasResumeUrl && !resumeFile) {
      throw new HttpError(400, "Attach a CV or write a cover letter");
    }

    const requiredQuestionIds = job.questions.filter((q) => q.required).map((q) => q.id);
    const providedAnswers = input.answers ?? [];
    const providedIds = new Set(providedAnswers.map((a) => a.questionId));
    for (const requiredId of requiredQuestionIds) {
      if (!providedIds.has(requiredId)) {
        throw new HttpError(400, "Some required questions are missing answers");
      }
    }

    const existing = await JobApplicationRepository.findByJobAndApplicant(jobId, applicantId);
    if (existing) throw new HttpError(409, "You have already applied to this job");

    const created = await prisma.$transaction(async (tx) => {
      const ja = await tx.jobApplication.create({
        data: {
          jobId: job.id,
          applicantId,
          coverLetter: hasCoverLetter ? input.coverLetter! : null,
          resumeUrl: input.resumeUrl ? input.resumeUrl : null,
          resumeStorageKey: resumeFile?.storageKey ?? null,
          resumeFilename: resumeFile?.originalName ?? null,
          resumeMimeType: resumeFile?.mimeType ?? null,
          resumeSize: resumeFile?.size ?? null,
          status: "APPLIED",
        },
      });
      if (providedAnswers.length > 0) {
        const validIds = new Set(job.questions.map((q) => q.id));
        const filtered = providedAnswers.filter((a) => validIds.has(a.questionId));
        await tx.applicationAnswer.createMany({
          data: filtered.map((a) => ({
            jobApplicationId: ja.id,
            questionId: a.questionId,
            answer: a.answer,
          })),
        });
      }
      await tx.application.create({
        data: {
          userId: applicantId,
          company: job.company.name,
          role: job.title,
          status: "APPLIED",
          source: "Job Board",
          location: job.location ?? null,
          jobApplicationId: ja.id,
        },
      });
      return ja;
    });

    realtime.publishToCompany(job.companyId, {
      type: "application.created",
      jobApplicationId: created.id,
      jobId: job.id,
    });

    return created;
  },
};
