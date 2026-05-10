import type {
  AppStatus,
  BulkUpdateJobApplicationsInput,
  UpdateJobApplicationInput,
} from "@smartjob/shared";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../middleware/error.js";
import { RecruiterRepository } from "../jobs/jobs.repository.js";
import { JobApplicationRepository } from "./jobApplications.repository.js";
import { realtime } from "../realtime/realtime.bus.js";

const requireRecruiterCompany = async (userId: string) => {
  const recruiter = await RecruiterRepository.findCompanyId(userId);
  if (!recruiter?.companyId) throw new HttpError(403, "Recruiter has no company");
  return recruiter as { id: string; companyId: string };
};

export const JobApplicationsService = {
  async getForRecruiter(id: string, userId: string) {
    const recruiter = await requireRecruiterCompany(userId);
    const ja = await JobApplicationRepository.findForRecruiter(id, recruiter.companyId);
    if (!ja) throw new HttpError(404, "Application not found");
    return ja;
  },

  async updateForRecruiter(id: string, userId: string, input: UpdateJobApplicationInput) {
    const recruiter = await requireRecruiterCompany(userId);
    const ja = await JobApplicationRepository.findForRecruiter(id, recruiter.companyId);
    if (!ja) throw new HttpError(404, "Application not found");

    const next = await prisma.$transaction(async (tx) => {
      const updated = await JobApplicationRepository.updateInTx(tx, ja.id, {
        status: input.status,
        recruiterNote:
          input.recruiterNote === undefined ? undefined : input.recruiterNote,
      });
      if (input.status && ja.trackerEntry) {
        await JobApplicationRepository.mirrorTrackerStatus(
          tx,
          ja.trackerEntry.id,
          input.status,
        );
      }
      return updated;
    });

    if (input.status) {
      realtime.publishToUser(ja.applicantId, {
        type: "application.status",
        jobApplicationId: ja.id,
        jobId: ja.jobId,
        applicantId: ja.applicantId,
        status: input.status,
      });
    }

    return next;
  },

  async bulkUpdateForRecruiter(userId: string, input: BulkUpdateJobApplicationsInput) {
    const recruiter = await requireRecruiterCompany(userId);
    const updatedIds = await JobApplicationRepository.bulkUpdateForCompany(
      input.ids,
      recruiter.companyId,
      input.status,
    );
    return { updated: updatedIds.length, status: input.status, ids: updatedIds };
  },

  listMine(applicantId: string) {
    return JobApplicationRepository.listByApplicant(applicantId);
  },

  async listForRecruiterInbox(userId: string, status?: AppStatus) {
    const recruiter = await requireRecruiterCompany(userId);
    return JobApplicationRepository.listForCompany(recruiter.companyId, status);
  },

  async withdraw(id: string, applicantId: string) {
    const ja = await JobApplicationRepository.findOwnedByApplicant(id, applicantId);
    if (!ja) throw new HttpError(404, "Application not found");
    if (ja.status === "WITHDRAWN") return;

    await prisma.$transaction(async (tx) => {
      await tx.jobApplication.update({
        where: { id: ja.id },
        data: { status: "WITHDRAWN" },
      });
      await tx.application.updateMany({
        where: { jobApplicationId: ja.id },
        data: { status: "WITHDRAWN" },
      });
    });

    realtime.publishToCompany(ja.job.companyId, {
      type: "application.status",
      jobApplicationId: ja.id,
      jobId: ja.job.id,
      applicantId,
      status: "WITHDRAWN",
    });
  },
};
