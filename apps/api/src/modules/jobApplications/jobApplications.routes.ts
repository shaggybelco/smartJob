import { Router } from "express";
import {
  requireApprovedRecruiter,
  requireAuth,
  requireRole,
} from "../../middleware/auth.js";
import { JobApplicationsController } from "./jobApplications.controller.js";

export const jobApplicationsRouter = Router();
jobApplicationsRouter.use(requireAuth, requireApprovedRecruiter);
jobApplicationsRouter.post("/bulk", JobApplicationsController.bulkUpdate);
jobApplicationsRouter.get("/:id", JobApplicationsController.detailForRecruiter);
jobApplicationsRouter.patch("/:id", JobApplicationsController.updateForRecruiter);

export const myJobApplicationsRouter = Router();
myJobApplicationsRouter.use(requireAuth, requireRole("APPLICANT"));
myJobApplicationsRouter.get("/", JobApplicationsController.listMine);
myJobApplicationsRouter.post("/:id/withdraw", JobApplicationsController.withdraw);

export const recruiterApplicationsRouter = Router();
recruiterApplicationsRouter.use(requireAuth, requireApprovedRecruiter);
recruiterApplicationsRouter.get("/", JobApplicationsController.recruiterInbox);
