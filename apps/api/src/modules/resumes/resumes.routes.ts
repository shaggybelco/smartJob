import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { ResumesController } from "./resumes.controller.js";

/** Mounted at /api/resumes/:id (the :id is a JobApplication id). */
const router = Router();
router.use(requireAuth);
router.get("/:id", ResumesController.download);

export default router;
