import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { SavedJobsController } from "./savedJobs.controller.js";

export const savedJobsRouter = Router();
savedJobsRouter.use(requireAuth, requireRole("APPLICANT"));
savedJobsRouter.get("/", SavedJobsController.list);
savedJobsRouter.get("/ids", SavedJobsController.ids);
savedJobsRouter.put("/:id", SavedJobsController.save);
savedJobsRouter.delete("/:id", SavedJobsController.unsave);
