import { Router } from "express";
import {
  requireApprovedRecruiter,
  requireAuth,
  requireRole,
} from "../../middleware/auth.js";
import { resumeUpload } from "../../middleware/upload.js";
import { JobsController } from "./jobs.controller.js";

export const jobsRouter = Router();

// Public
jobsRouter.get("/", JobsController.list);
jobsRouter.get("/:id", JobsController.detail);

// Recruiter mutations require an approved (or admin) membership
jobsRouter.post("/", requireAuth, requireApprovedRecruiter, JobsController.create);
jobsRouter.patch("/:id", requireAuth, requireApprovedRecruiter, JobsController.update);
jobsRouter.patch("/:id/close", requireAuth, requireApprovedRecruiter, JobsController.close);
jobsRouter.delete("/:id", requireAuth, requireApprovedRecruiter, JobsController.remove);
jobsRouter.get(
  "/:id/applications",
  requireAuth,
  requireApprovedRecruiter,
  JobsController.inbox,
);

// Applicant
jobsRouter.post(
  "/:id/apply",
  requireAuth,
  requireRole("APPLICANT"),
  resumeUpload,
  JobsController.apply,
);

// Recruiter's own company jobs (list view) - approved recruiters only
export const recruiterJobsRouter = Router();
recruiterJobsRouter.use(requireAuth, requireApprovedRecruiter);
recruiterJobsRouter.get("/", JobsController.myJobs);
