import path from "node:path";
import fs from "node:fs";
import { UPLOADS_DIR } from "../../config/storage.js";
import { HttpError } from "../../middleware/error.js";
import { prisma } from "../../config/prisma.js";
import { ResumeRepository } from "./resumes.repository.js";

export interface ResolvedResume {
  absolutePath: string;
  filename: string;
  mimeType: string;
  size: number;
}

export const ResumesService = {
  /**
   * Resolve a resume file for download. Throws 404 if the requester isn't
   * allowed to see it or the file is missing on disk.
   */
  async resolve(jobApplicationId: string, requesterUserId: string): Promise<ResolvedResume> {
    // Look up requester's role + companyId so we can scope access.
    const requester = await prisma.user.findUnique({
      where: { id: requesterUserId },
      select: { role: true, companyId: true },
    });
    if (!requester) throw new HttpError(401, "User no longer exists");

    const ja = await ResumeRepository.findAuthorized(
      jobApplicationId,
      requesterUserId,
      requester.role === "RECRUITER" ? requester.companyId : null,
    );

    if (!ja || !ja.resumeStorageKey) throw new HttpError(404, "Resume not found");

    const absolutePath = path.join(UPLOADS_DIR, ja.resumeStorageKey);
    if (!fs.existsSync(absolutePath)) {
      throw new HttpError(404, "Resume file is missing on disk");
    }

    return {
      absolutePath,
      filename: ja.resumeFilename ?? "resume",
      mimeType: ja.resumeMimeType ?? "application/octet-stream",
      size: ja.resumeSize ?? 0,
    };
  },
};
