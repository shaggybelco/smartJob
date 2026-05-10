import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { JobApplicationsController } from "./jobApplications.controller.js";

export const jobApplicationsRouter = Router();
jobApplicationsRouter.use(requireAuth, requireRole("RECRUITER"));
jobApplicationsRouter.post("/bulk", JobApplicationsController.bulkUpdate);
jobApplicationsRouter.get("/:id", JobApplicationsController.detailForRecruiter);
jobApplicationsRouter.patch("/:id", JobApplicationsController.updateForRecruiter);

export const myJobApplicationsRouter = Router();
myJobApplicationsRouter.use(requireAuth, requireRole("APPLICANT"));
myJobApplicationsRouter.get("/", JobApplicationsController.listMine);
myJobApplicationsRouter.post("/:id/withdraw", JobApplicationsController.withdraw);

export const recruiterApplicationsRouter = Router();
recruiterApplicationsRouter.use(requireAuth, requireRole("RECRUITER"));
recruiterApplicationsRouter.get("/", JobApplicationsController.recruiterInbox);
