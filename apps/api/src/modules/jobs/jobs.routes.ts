import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { resumeUpload } from "../../middleware/upload.js";
import { JobsController } from "./jobs.controller.js";

/** Mounted at /api/jobs — mixes public, recruiter, and applicant routes. */
export const jobsRouter = Router();

// Public
jobsRouter.get("/", JobsController.list);
jobsRouter.get("/:id", JobsController.detail);

// Recruiter-only
jobsRouter.post("/", requireAuth, requireRole("RECRUITER"), JobsController.create);
jobsRouter.patch("/:id", requireAuth, requireRole("RECRUITER"), JobsController.update);
jobsRouter.patch("/:id/close", requireAuth, requireRole("RECRUITER"), JobsController.close);
jobsRouter.delete("/:id", requireAuth, requireRole("RECRUITER"), JobsController.remove);
jobsRouter.get(
  "/:id/applications",
  requireAuth,
  requireRole("RECRUITER"),
  JobsController.inbox,
);

// Applicant-only — accepts multipart/form-data so a CV file can be attached.
// `resume` is the file field name; `coverLetter` and `resumeUrl` are text fields.
jobsRouter.post(
  "/:id/apply",
  requireAuth,
  requireRole("APPLICANT"),
  resumeUpload,
  JobsController.apply,
);

/** Mounted at /api/recruiter/jobs — recruiter's own company jobs. */
export const recruiterJobsRouter = Router();
recruiterJobsRouter.use(requireAuth, requireRole("RECRUITER"));
recruiterJobsRouter.get("/", JobsController.myJobs);
