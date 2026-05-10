import { prisma } from "../../config/prisma.js";

export const ResumeRepository = {
  /**
   * Look up the file metadata, scoped so only the recruiter at the owning
   * company OR the applicant themselves can fetch it.
   */
  findAuthorized: (
    jobApplicationId: string,
    requesterUserId: string,
    requesterCompanyId: string | null,
  ) =>
    prisma.jobApplication.findFirst({
      where: {
        id: jobApplicationId,
        OR: [
          { applicantId: requesterUserId },
          ...(requesterCompanyId
            ? [{ job: { companyId: requesterCompanyId } }]
            : []),
        ],
      },
      select: {
        resumeStorageKey: true,
        resumeFilename: true,
        resumeMimeType: true,
        resumeSize: true,
      },
    }),
};
